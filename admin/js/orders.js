// Orders Logic

function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const orders = window.AppData.orders || [];
    
    // Apply filters
    const search = document.getElementById('orderSearch')?.value.toLowerCase();
    const filterStatus = document.getElementById('orderStatusFilter')?.value;

    let filtered = orders;
    if (search) {
        filtered = filtered.filter(o => 
            (o.id && o.id.toLowerCase().includes(search)) || 
            (o.customer && o.customer.toLowerCase().includes(search)) ||
            (o.phone && o.phone.toLowerCase().includes(search))
        );
    }
    if (filterStatus) {
        filtered = filtered.filter(o => o.status === filterStatus);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">No orders found</td></tr>`;
        return;
    }

    filtered.forEach(o => {
        const tr = document.createElement('tr');
        const dateStr = o.date ? new Date(o.date).toLocaleDateString('en-GB') : 'N/A';
        const total = window.money ? window.money(o.total || 0) : `Rs. ${o.total}`;
        
        let displayStatus = o.status || 'Pending';
        let statusBadge = 'badge-secondary';
        if(displayStatus === 'Pending') statusBadge = 'badge-warning';
        if(displayStatus === 'Processing') statusBadge = 'badge-info';
        if(displayStatus === 'Completed') statusBadge = 'badge-success';
        if(displayStatus === 'Cancelled') statusBadge = 'badge-danger';

        tr.innerHTML = `
            <td>
                <div style="font-weight:600;">#${o.id || 'N/A'}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${dateStr}</div>
            </td>
            <td>
                <div style="font-weight:500;">${o.customer || 'Unknown'}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${o.phone || ''}</div>
            </td>
            <td>
                <div>${o.items ? o.items.length : 0} items</div>
            </td>
            <td style="font-weight:600;">${total}</td>
            <td>
                <select onchange="updateOrderStatus('${o.id}', this.value)" style="padding:0.25rem 0.5rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-main); font-size:0.875rem;">
                    <option value="Pending" ${displayStatus==='Pending'?'selected':''}>Pending</option>
                    <option value="Processing" ${displayStatus==='Processing'?'selected':''}>Processing</option>
                    <option value="Completed" ${displayStatus==='Completed'?'selected':''}>Completed</option>
                    <option value="Cancelled" ${displayStatus==='Cancelled'?'selected':''}>Cancelled</option>
                </select>
            </td>
            <td style="text-align:right;">
                <button class="icon-btn" onclick="viewOrder('${o.id}')" title="View Details"><i data-lucide="eye"></i></button>
                <button class="icon-btn" onclick="printInvoice('${o.id}')" title="Print Invoice"><i data-lucide="printer"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if(window.lucide) lucide.createIcons();
}

async function updateOrderStatus(id, newStatus) {
    try {
        await db.collection("orders").doc(id).update({ status: newStatus });
        alert("Order status updated to " + newStatus);
    } catch(e) {
        alert("Error updating order: " + e.message);
    }
}

function viewOrder(id) {
    const o = window.AppData.orders.find(x => x.id === id);
    if(!o) return;
    
    document.getElementById('modalOrderId').textContent = `#${o.id}`;
    document.getElementById('modalOrderDate').textContent = o.date ? new Date(o.date).toLocaleString('en-GB') : 'N/A';
    
    const custInfo = document.getElementById('modalCustomerInfo');
    custInfo.innerHTML = `
        <p><strong>Name:</strong> ${o.customer || 'N/A'}</p>
        <p><strong>Email:</strong> ${o.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${o.phone || 'N/A'}</p>
        <p><strong>Address:</strong> ${o.address || 'N/A'}, ${o.city || ''}</p>
    `;
    
    const itemsList = document.getElementById('modalOrderItems');
    itemsList.innerHTML = '';
    let subtotal = 0;
    
    if(o.items && o.items.length > 0) {
        o.items.forEach(item => {
            const tr = document.createElement('tr');
            const pId = typeof item.id === 'object' ? item.id.id : item.id;
            const price = Number(item.price || 0);
            const qty = Number(item.qty || 1);
            const lineTotal = price * qty;
            subtotal += lineTotal;
            
            tr.innerHTML = `
                <td>
                    <div style="font-weight:500;">${item.title || 'Product'}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">SKU: ${pId || ''}</div>
                </td>
                <td>${price}</td>
                <td>x${qty}</td>
                <td style="text-align:right;">${lineTotal}</td>
            `;
            itemsList.appendChild(tr);
        });
    } else {
        itemsList.innerHTML = `<tr><td colspan="4" style="text-align:center;">No items</td></tr>`;
    }
    
    document.getElementById('modalSubtotal').textContent = window.money ? window.money(subtotal) : subtotal;
    const shipping = o.shipping || 0;
    document.getElementById('modalShipping').textContent = window.money ? window.money(shipping) : shipping;
    document.getElementById('modalTotal').textContent = window.money ? window.money(o.total || (subtotal+shipping)) : (o.total || (subtotal+shipping));
    
    document.getElementById('orderModal').style.display = 'flex';
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

function printInvoice(id) {
    const o = window.AppData.orders.find(x => x.id === id);
    if(!o) return;
    
    let itemsHtml = '';
    if(o.items) {
        o.items.forEach(item => {
            itemsHtml += `
                <tr>
                    <td style="padding:8px; border-bottom:1px solid #ddd;">${item.title || 'Product'}</td>
                    <td style="padding:8px; border-bottom:1px solid #ddd;">${item.price || 0}</td>
                    <td style="padding:8px; border-bottom:1px solid #ddd;">${item.qty || 1}</td>
                    <td style="padding:8px; border-bottom:1px solid #ddd; text-align:right;">${(item.price||0) * (item.qty||1)}</td>
                </tr>
            `;
        });
    }

    const printWin = window.open('', '', 'width=800,height=600');
    printWin.document.write(`
        <html>
            <head>
                <title>Invoice #${o.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .invoice-title { font-size: 24px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { text-align: left; padding: 8px; border-bottom: 2px solid #333; }
                    .totals { margin-top: 20px; text-align: right; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h2>Study Pack</h2>
                        <p>taleemihub.com</p>
                    </div>
                    <div style="text-align:right;">
                        <div class="invoice-title">INVOICE</div>
                        <p>Order #${o.id}</p>
                        <p>Date: ${o.date ? new Date(o.date).toLocaleDateString('en-GB') : ''}</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <strong>Bill To:</strong><br>
                    ${o.customer || ''}<br>
                    ${o.address || ''}, ${o.city || ''}<br>
                    ${o.phone || ''}
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th style="text-align:right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <div class="totals">
                    <p>Subtotal: ${o.total - (o.shipping||0)}</p>
                    <p>Shipping: ${o.shipping || 0}</p>
                    <h3>Grand Total: ${o.total}</h3>
                </div>
                
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
        </html>
    `);
    printWin.document.close();
}

document.getElementById('orderSearch')?.addEventListener('input', renderOrders);
document.getElementById('orderStatusFilter')?.addEventListener('change', renderOrders);

document.querySelector('.nav-item[data-view="orders"]')?.addEventListener('click', () => {
    setTimeout(renderOrders, 100);
});

document.addEventListener('appDataLoaded', (e) => {
    if (e.detail === 'orders' && document.getElementById('orders')?.classList.contains('active')) {
        renderOrders();
    }
});
