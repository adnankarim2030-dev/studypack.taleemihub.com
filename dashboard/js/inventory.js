/* ============================================================
   Inventory module — stock status, low-stock highlighting,
   quick in/out toggle.
   ============================================================ */

window.renderInventory = function() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    let products = window.AppData.products || [];
    const search = (document.getElementById('invSearch')?.value || '').toLowerCase();
    const filter = document.getElementById('invStockFilter')?.value;

    products = products.filter(p => {
        if (search && !(p.title || '').toLowerCase().includes(search)) return false;
        if (filter === 'in' && p.stock === false) return false;
        if (filter === 'out' && p.stock !== false) return false;
        return true;
    });

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i data-lucide="package-x"></i><p>No products found</p></div></td></tr>`;
        lucide.createIcons();
        return;
    }

    tbody.innerHTML = products.map(p => {
        const inStock = p.stock !== false;
        return `
        <tr class="${!inStock ? 'low-stock-row' : ''}">
            <td><div style="font-weight:600;">${escapeHtml(p.title)}</div><div class="text-muted mono" style="font-size:0.75rem;">${escapeHtml(p.id || 'N/A')}</div></td>
            <td>${escapeHtml(p.category || 'Books')}</td>
            <td>${inStock ? `<span class="badge badge-success">In Stock</span>` : `<span class="badge badge-danger">Out of Stock</span>`}</td>
            <td style="text-align:right;">
                <button class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="toggleStock('${p.id}', ${inStock})">
                    Mark ${inStock ? 'Out of Stock' : 'In Stock'}
                </button>
            </td>
        </tr>`;
    }).join('');
    lucide.createIcons();
};

['invSearch', 'invStockFilter'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => window.renderInventory());
    document.getElementById(id)?.addEventListener('change', () => window.renderInventory());
});

window.toggleStock = async function(id, currentlyInStock) {
    try {
        await db.collection('products').doc(String(id)).update({ stock: !currentlyInStock });
        showToast('Stock status updated');
    } catch (e) {
        showToast('Error updating stock: ' + e.message, 'error');
    }
};
