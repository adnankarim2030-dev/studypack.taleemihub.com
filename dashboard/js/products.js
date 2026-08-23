/* ============================================================
   Products module — list/search/filter, CRUD, image upload (ImgBB),
   margin calculator, pagination.
   ============================================================ */

const PRODUCTS_PER_PAGE = 15;
let __productsPage = 1;

function populateCategoryFilters() {
    const catSel = document.getElementById('filterCategory');
    const clsSel = document.getElementById('filterClass');
    if (!catSel || !clsSel) return;

    const products = window.AppData.products || [];
    const baseCats = ['Books', 'Academic', 'Stationery', 'Toys', 'Courses'];
    const dynamicCats = products.map(p => p.category).filter(Boolean);
    const cats = [...new Set([...baseCats, ...dynamicCats])].sort();
    const classes = [...new Set(products.map(p => p.cls).filter(Boolean))].sort();

    const keepFirst = (sel) => sel.options[0] ? sel.options[0].outerHTML : '';
    catSel.innerHTML = keepFirst(catSel) + cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    clsSel.innerHTML = keepFirst(clsSel) + classes.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

window.renderProducts = function() {
    const tbody = document.getElementById('productsTbody');
    if (!tbody) return;

    populateCategoryFilters();

    let products = window.AppData.products || [];
    const search = (document.getElementById('prodSearch')?.value || '').toLowerCase();
    const cat = document.getElementById('filterCategory')?.value;
    const cls = document.getElementById('filterClass')?.value;
    const stockFilter = document.getElementById('filterStock')?.value;

    products = products.filter(p => {
        if (search && !(p.title || '').toLowerCase().includes(search)) return false;
        if (cat && p.category !== cat) return false;
        if (cls && p.cls !== cls) return false;
        if (stockFilter === 'in' && p.stock === false) return false;
        if (stockFilter === 'out' && p.stock !== false) return false;
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
    if (__productsPage > totalPages) __productsPage = totalPages;
    const pageItems = products.slice((__productsPage - 1) * PRODUCTS_PER_PAGE, __productsPage * PRODUCTS_PER_PAGE);

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i data-lucide="package-x"></i><p>No products found</p></div></td></tr>`;
    } else {
        tbody.innerHTML = pageItems.map(p => {
            const imgSrc = p.img || 'https://placehold.co/100x100?text=No+Image';
            return `
            <tr>
                <td><img src="${imgSrc}" onerror="this.src='https://placehold.co/100x100?text=Error'" style="width:44px;height:44px;object-fit:cover;border-radius:8px;"></td>
                <td>
                    <div style="font-weight:600;">${escapeHtml(p.title)}</div>
                    <div class="text-muted mono" style="font-size:0.75rem;">${escapeHtml(p.id || 'N/A')}</div>
                </td>
                <td>
                    <span class="badge badge-info">${escapeHtml(p.category || 'Books')}</span>
                    ${p.subj ? `<div class="text-muted" style="font-size:0.75rem; margin-top:4px;">${escapeHtml(p.cls || '')} ${escapeHtml(p.subj)}</div>` : ''}
                </td>
                <td>${money(p.price)} ${p.d_price ? `<del class="text-muted" style="font-size:0.75rem; margin-left:4px;">${money(p.d_price)}</del>` : ''}</td>
                <td>${p.stock !== false ? `<span class="badge badge-success">In Stock</span>` : `<span class="badge badge-danger">Out of Stock</span>`}</td>
                <td style="text-align:right;">
                    <button class="icon-btn-sm" onclick="openProductModal('${p.id}')" title="Edit"><i data-lucide="edit-2"></i></button>
                    <button class="icon-btn-sm danger" onclick="deleteProduct('${p.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>`;
        }).join('');
    }

    renderPagination('productsPagination', products.length, __productsPage, totalPages, (p) => { __productsPage = p; window.renderProducts(); });
    lucide.createIcons();
};

function renderPagination(containerId, totalItems, currentPage, totalPages, onPage) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (totalItems === 0) { el.innerHTML = ''; return; }

    let btns = '';
    const maxBtns = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    for (let i = start; i <= end; i++) {
        btns += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    el.innerHTML = `
        <span class="page-info">${totalItems} total</span>
        <div class="page-btns">
            <button data-page="prev" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>
            ${btns}
            <button data-page="next" ${currentPage >= totalPages ? 'disabled' : ''}>›</button>
        </div>`;

    el.querySelectorAll('button[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.dataset.page;
            if (val === 'prev') onPage(Math.max(1, currentPage - 1));
            else if (val === 'next') onPage(Math.min(totalPages, currentPage + 1));
            else onPage(Number(val));
        });
    });
}
window.renderPagination = renderPagination;

['prodSearch', 'filterCategory', 'filterClass', 'filterStock'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => { __productsPage = 1; window.renderProducts(); });
    document.getElementById(id)?.addEventListener('change', () => { __productsPage = 1; window.renderProducts(); });
});

/* ---------------- Modal ---------------- */
window.openProductModal = function(prodId) {
    const modal = document.getElementById('productModal');
    document.getElementById('prodImgFile').value = '';

    if (prodId) {
        document.getElementById('modalTitle').textContent = 'Edit Product';
        const p = window.AppData.products.find(x => String(x.id) === String(prodId));
        if (p) {
            document.getElementById('prodId').value = p.id;
            document.getElementById('prodTitle').value = p.title || '';
            document.getElementById('prodCategory').value = p.category || 'Books';
            document.getElementById('prodPrice').value = p.price || '';
            document.getElementById('prodPurchasePrice').value = p.purchase_price || '';
            document.getElementById('prodDiscPrice').value = p.d_price || '';
            document.getElementById('prodProvince').value = p.province || '';
            document.getElementById('prodClass').value = p.cls || '';
            document.getElementById('prodSubject').value = p.subj || '';
            document.getElementById('prodImg').value = p.img || '';
            document.getElementById('prodImgPreview').src = p.img || 'https://placehold.co/80x80';
            document.getElementById('prodStock').checked = p.stock !== false;
            calculateMargin();
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Add New Product';
        document.getElementById('productForm').reset();
        document.getElementById('prodId').value = '';
        document.getElementById('prodImg').value = '';
        document.getElementById('prodImgPreview').src = 'https://placehold.co/80x80';
        document.getElementById('prodStock').checked = true;
        calculateMargin();
    }
    modal.classList.add('show');
    lucide.createIcons();
};

window.closeProductModal = function() {
    document.getElementById('productModal').classList.remove('show');
};

document.getElementById('prodImgFile')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => { document.getElementById('prodImgPreview').src = evt.target.result; };
    reader.readAsDataURL(file);
});

window.calculateMargin = function() {
    const p = parseFloat(document.getElementById('prodPurchasePrice').value) || 0;
    const s = parseFloat(document.getElementById('prodPrice').value) || 0;
    const display = document.getElementById('marginDisplay');
    if (s > 0 && p > 0) {
        const profit = s - p;
        const margin = ((profit / s) * 100).toFixed(1);
        display.textContent = `Profit Margin: ${margin}% (Rs. ${profit})`;
        display.style.color = profit >= 0 ? 'var(--success)' : 'var(--danger)';
    } else {
        display.textContent = 'Profit Margin: 0% (Rs. 0)';
        display.style.color = 'var(--text-secondary)';
    }
};

document.getElementById('productForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;

    try {
        const id = document.getElementById('prodId').value || Date.now().toString();
        let imageUrl = document.getElementById('prodImg').value;

        const fileInput = document.getElementById('prodImgFile');
        if (fileInput.files.length > 0) {
            btn.textContent = 'Uploading Image...';
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append('image', file);
            const imgBB_API_KEY = 'f14a4449997d84ded74a12b023bc2a02';
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgBB_API_KEY}`, { method: 'POST', body: formData });
            const result = await response.json();
            if (result.success) imageUrl = result.data.url;
            else throw new Error('Image upload failed: ' + (result.error ? result.error.message : 'Unknown error'));
        }

        btn.textContent = 'Saving...';
        const data = {
            id: id.toString(),
            title: document.getElementById('prodTitle').value.trim(),
            price: Number(document.getElementById('prodPrice').value) || 0,
            purchase_price: Number(document.getElementById('prodPurchasePrice').value) || 0,
            d_price: document.getElementById('prodDiscPrice').value ? Number(document.getElementById('prodDiscPrice').value) : null,
            province: document.getElementById('prodProvince').value.trim(),
            cls: document.getElementById('prodClass').value.trim(),
            subj: document.getElementById('prodSubject').value.trim(),
            img: imageUrl || '',
            stock: document.getElementById('prodStock').checked,
            category: document.getElementById('prodCategory').value || 'Books',
            updatedAt: Date.now()
        };

        await db.collection('products').doc(id).set(data, { merge: true });
        showToast('Product saved successfully');
        closeProductModal();
    } catch (err) {
        console.error(err);
        showToast('Error saving product: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
});

window.deleteProduct = async function(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
        await db.collection('products').doc(String(id)).delete();
        showToast('Product deleted');
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
};

window.exportProductsCSV = function() {
    const products = window.AppData.products || [];
    if (products.length === 0) return showToast('No products to export', 'error');
    let csv = 'SKU,Title,Category,Purchase Price,Sale Price,In Stock\n';
    products.forEach(p => {
        csv += `${p.id},"${(p.title || '').replace(/"/g, '""')}","${p.category || ''}",${p.purchase_price || 0},${p.price || 0},${p.stock !== false ? 'Yes' : 'No'}\n`;
    });
    downloadCSV(csv, `Products_Export_${new Date().toISOString().split('T')[0]}.csv`);
};

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}
window.downloadCSV = downloadCSV;
