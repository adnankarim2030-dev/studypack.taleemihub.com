
function renderInventory() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;
    
    const products = window.AppData.products || [];
    
    tbody.innerHTML = '';
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No inventory data</td></tr>`;
        return;
    }
    
    products.forEach(p => {
        const tr = document.createElement('tr');
        const inStock = p.stock !== false;
        tr.innerHTML = `
            <td>
                <div style="font-weight:600;">${p.title}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${p.id || 'N/A'}</div>
            </td>
            <td>${p.category || 'Books'}</td>
            <td>
                ${inStock ? `<span class="badge badge-success">In Stock</span>` : `<span class="badge badge-danger">Out of Stock</span>`}
            </td>
            <td>
                <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.8rem;" onclick="toggleStock('${p.id}', ${inStock})">
                    Mark ${inStock ? 'Out of Stock' : 'In Stock'}
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.toggleStock = async function(id, currentlyInStock) {
    try {
        await db.collection("products").doc(String(id)).update({ stock: !currentlyInStock });
    } catch(e) {
        alert("Error updating stock: " + e.message);
    }
}

document.addEventListener('appDataLoaded', (e) => {
    if (document.getElementById('inventory')?.classList.contains('active')) {
        renderInventory();
    }
});
document.querySelector('.nav-item[data-view="inventory"]')?.addEventListener('click', () => {
    setTimeout(renderInventory, 100);
});
