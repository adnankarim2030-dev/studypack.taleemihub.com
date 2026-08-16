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
                <button class="icon-btn" onclick="openProductModal('${p.id}')" title="Edit"><i data-lucide="edit-2"></i></button>
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
    
    // Reset file input and preview
    document.getElementById('prodImgFile').value = '';
    document.getElementById('prodImgPreview').src = 'https://placehold.co/80x80';

    if (prodId) {
        document.getElementById('modalTitle').textContent = 'Edit Product';
        const p = window.AppData.products.find(x => x.id == prodId);
        if(p) {
            document.getElementById('prodId').value = p.id;
            document.getElementById('prodTitle').value = p.title || '';
            document.getElementById('prodPrice').value = p.price || '';
            document.getElementById('prodPurchasePrice').value = p.purchase_price || '';
            calculateMargin();
            document.getElementById('prodDiscPrice').value = p.d_price || '';
            document.getElementById('prodProvince').value = p.province || '';
            document.getElementById('prodClass').value = p.cls || '';
            document.getElementById('prodSubject').value = p.subj || '';
            document.getElementById('prodImg').value = p.img || '';
            if(p.img) document.getElementById('prodImgPreview').src = p.img;
            document.getElementById('prodStock').checked = p.stock !== false;
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Add New Product';
        form.reset();
        document.getElementById('prodId').value = '';
        document.getElementById('prodImg').value = '';
    }
    
    modal.style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Image Preview
document.getElementById('prodImgFile')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            document.getElementById('prodImgPreview').src = evt.target.result;
        }
        reader.readAsDataURL(file);
    }
});

// Helper for timeout
const uploadWithTimeout = (uploadTask, timeoutMs) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Firebase Storage upload timed out. Please check if Storage is enabled in Firebase Console and rules allow writes.')), timeoutMs);
        uploadTask.then(
            res => { clearTimeout(timer); resolve(res); },
            err => { clearTimeout(timer); reject(err); }
        );
    });
};

document.getElementById('productForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        const id = document.getElementById('prodId').value || Date.now().toString();
        let imageUrl = document.getElementById('prodImg').value;

        // Check if file is selected for upload
        const fileInput = document.getElementById('prodImgFile');
        if(fileInput.files.length > 0) {
            const file = fileInput.files[0];
            btn.textContent = 'Uploading Image...';
            
            const formData = new FormData();
            formData.append('image', file);

            const imgBB_API_KEY = "f14a4449997d84ded74a12b023bc2a02";
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgBB_API_KEY}`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (result.success) {
                imageUrl = result.data.url;
            } else {
                throw new Error("ImgBB Upload Failed: " + (result.error ? result.error.message : 'Unknown error'));
            }
        }

        btn.textContent = 'Saving Data...';

        const data = {
            id: id.toString(),
            title: document.getElementById('prodTitle').value,
            price: Number(document.getElementById('prodPrice').value),
            purchase_price: Number(document.getElementById('prodPurchasePrice').value) || 0,
            d_price: document.getElementById('prodDiscPrice').value ? Number(document.getElementById('prodDiscPrice').value) : null,
            province: document.getElementById('prodProvince').value,
            cls: document.getElementById('prodClass').value,
            subj: document.getElementById('prodSubject').value,
            img: imageUrl,
            stock: document.getElementById('prodStock').checked,
            category: document.getElementById('filterCategory').value || 'Books'
        };

        await db.collection("products").doc(id).set(data, {merge: true});
        alert('Product saved successfully!');
        closeProductModal();
    } catch (err) {
        console.error(err);
        alert('Error saving product:\n' + err.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});

async function deleteProduct(id) {
    if(confirm('Are you sure you want to delete this product?')) {
        try {
            await db.collection("products").doc(String(id)).delete();
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


function calculateMargin() {
    const p = parseFloat(document.getElementById('prodPurchasePrice').value) || 0;
    const s = parseFloat(document.getElementById('prodPrice').value) || 0;
    const display = document.getElementById('marginDisplay');
    if(s > 0 && p > 0) {
        const profit = s - p;
        const margin = ((profit / s) * 100).toFixed(1);
        display.textContent = `Profit Margin: ${margin}% (Rs. ${profit})`;
        display.style.color = profit >= 0 ? 'var(--success)' : 'var(--danger)';
    } else {
        display.textContent = 'Profit Margin: 0% (Rs. 0)';
        display.style.color = 'var(--text-muted)';
    }
}
window.calculateMargin = calculateMargin;
