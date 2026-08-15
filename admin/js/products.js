document.addEventListener('appDataLoaded', (e) => {
    if (e.detail === 'products') {
        renderProducts();
    }
});

function renderProducts() {
    const tbody = document.getElementById('productsTbody');
    if (!tbody) return;

    let products = window.AppData.products || [];
    
    // Apply Filters
    const search = document.getElementById('prodSearch')?.value.toLowerCase();
    const cat = document.getElementById('filterCategory')?.value;
    const prov = document.getElementById('filterProvince')?.value;
    const cls = document.getElementById('filterClass')?.value;
    const subj = document.getElementById('filterSubject')?.value;

    products = products.filter(p => {
        let match = true;
        if(search && !(p.title||'').toLowerCase().includes(search)) match = false;
        if(cat && p.category !== cat) match = false;
        if(prov && p.province !== prov) match = false;
        if(cls && p.cls !== cls) match = false;
        if(subj && p.subj !== subj) match = false;
        return match;
    });

    tbody.innerHTML = '';
    
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem;">No products found</td></tr>`;
        return;
    }

    products.forEach(p => {
        const tr = document.createElement('tr');
        
        // Image logic
        const imgSrc = p.img ? p.img : 'https://placehold.co/100x100?text=No+Image';
        
        tr.innerHTML = `
            <td>
                <img src="${imgSrc}" onerror="this.src='https://placehold.co/100x100?text=Error'" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
            </td>
            <td>
                <div style="font-weight:600;">${p.title}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${p.id || 'N/A'}</div>
            </td>
            <td>
                <span class="badge badge-info">${p.category || 'Books'}</span>
                ${p.subj ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">${p.cls || ''} ${p.subj}</div>` : ''}
            </td>
            <td>${window.money(p.price)} ${p.d_price ? `<del style="color:var(--text-muted); font-size:0.75rem; margin-left:4px;">${p.d_price}</del>` : ''}</td>
            <td>
                ${p.stock !== false ? `<span class="badge badge-success">In Stock</span>` : `<span class="badge badge-danger">Out of Stock</span>`}
            </td>
            <td style="text-align:right;">
                <button class="icon-btn" onclick="editProduct('${p.id}')" title="Edit"><i data-lucide="edit-2"></i></button>
                <button class="icon-btn" onclick="deleteProduct('${p.id}')" title="Delete" style="color:var(--danger);"><i data-lucide="trash-2"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    lucide.createIcons();
}

// Bind Filter Events
['prodSearch', 'filterCategory', 'filterProvince', 'filterClass', 'filterSubject'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', renderProducts);
    document.getElementById(id)?.addEventListener('change', renderProducts);
});

// Modal Logic
function openProductModal(prodId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    
    if (prodId) {
        document.getElementById('modalTitle').textContent = 'Edit Product';
        const p = window.AppData.products.find(x => x.id == prodId);
        if(p) {
            document.getElementById('prodId').value = p.id;
            document.getElementById('prodTitle').value = p.title || '';
            document.getElementById('prodPrice').value = p.price || '';
            document.getElementById('prodDiscPrice').value = p.d_price || '';
            document.getElementById('prodProvince').value = p.province || '';
            document.getElementById('prodClass').value = p.cls || '';
            document.getElementById('prodSubject').value = p.subj || '';
            document.getElementById('prodImg').value = p.img || '';
            document.getElementById('prodStock').checked = p.stock !== false;
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Add New Product';
        form.reset();
        document.getElementById('prodId').value = '';
    }
    
    modal.style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

document.getElementById('productForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        const id = document.getElementById('prodId').value || Date.now().toString();
        const data = {
            id: id.toString(),
            title: document.getElementById('prodTitle').value,
            price: Number(document.getElementById('prodPrice').value),
            d_price: document.getElementById('prodDiscPrice').value ? Number(document.getElementById('prodDiscPrice').value) : null,
            province: document.getElementById('prodProvince').value,
            cls: document.getElementById('prodClass').value,
            subj: document.getElementById('prodSubject').value,
            img: document.getElementById('prodImg').value,
            stock: document.getElementById('prodStock').checked,
            category: document.getElementById('filterCategory').value || 'Books' // simplified category assign
        };

        await db.collection("products").doc(id).set(data, {merge: true});
        alert('Product saved successfully!');
        closeProductModal();
    } catch (err) {
        console.error(err);
        alert('Error saving product: ' + err.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});

async function deleteProduct(id) {
    if(confirm('Are you sure you want to delete this product?')) {
        try {
            await db.collection("products").doc(id).delete();
            alert('Product deleted!');
        } catch(e) {
            alert('Error: ' + e.message);
        }
    }
}

// When nav switches to products, render immediately just in case
document.querySelector('.nav-item[data-view="products"]')?.addEventListener('click', () => {
    setTimeout(renderProducts, 100);
});
