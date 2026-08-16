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
    const o = window.AppData.orders.find(x => String(x.id) === String(id));
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
    const o = window.AppData.orders.find(x => String(x.id) === String(id));
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
                    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
                    .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #FCA311; padding-bottom: 20px; }
                    .header img { max-width: 100px; margin-bottom: 10px; }
                    .header-left h2 { margin: 0; font-size: 28px; color: #0B132B; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; }
                    .invoice-title { font-size: 32px; font-weight: bold; color: #0B132B; margin-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                    th { text-align: left; padding: 12px; background: #0B132B; color: white; }
                    td { padding: 12px; border-bottom: 1px solid #eee; }
                    .totals-container { display: flex; justify-content: flex-end; margin-top: 30px; }
                    .totals-table { width: 300px; }
                    .totals-table td { border: none; padding: 5px 12px; }
                    .grand-total { font-size: 20px; font-weight: bold; border-top: 2px solid #0B132B !important; color: #0B132B; }
                    .footer { margin-top: 50px; text-align: center; color: #777; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <div class="header">
                        <div class="header-left">
                            <h2>Study Pack</h2>
                            <p style="margin: 5px 0; color: #777;">Taleemihub.com</p>
                        </div>
                        <div style="text-align:right;">
                            <div class="invoice-title">INVOICE</div>
                            <p style="margin: 0; color: #555;"><strong>Order #:</strong> ${o.id}</p>
                            <p style="margin: 0; color: #555;"><strong>Date:</strong> ${o.date ? new Date(o.date).toLocaleDateString('en-GB') : ''}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                        <div>
                            <strong style="color: #0B132B; font-size: 18px;">Bill To:</strong><br>
                            <span style="font-size: 16px;">${o.customer || 'Customer Name'}</span><br>
                            ${o.address || 'Address not provided'}<br>
                            ${o.city || ''}<br>
                            ${o.phone || ''}
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th>Price</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <div class="totals-container">
                        <table class="totals-table">
                            <tr>
                                <td>Subtotal:</td>
                                <td style="text-align: right;">Rs. ${o.total - (o.shipping||0)}</td>
                            </tr>
                            <tr>
                                <td>Shipping:</td>
                                <td style="text-align: right;">Rs. ${o.shipping || 0}</td>
                            </tr>
                            <tr>
                                <td class="grand-total">Total:</td>
                                <td class="grand-total" style="text-align: right;">Rs. ${o.total}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="footer">
                        Thank you for your business!<br>
                        If you have any questions about this invoice, please contact support@taleemihub.com
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); }
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


window.editingOrderState = null;

window.toggleOrderEdit = function() {
    const info = document.getElementById('modalCustomerInfo');
    const edit = document.getElementById('modalCustomerEdit');
    
    if(info.style.display === 'none') {
        // Switch back to view mode
        info.style.display = 'block';
        edit.style.display = 'none';
        const id = document.getElementById('modalOrderId').textContent.replace('#', '');
        viewOrder(id); // Reload original
    } else {
        // Switch to edit mode
        info.style.display = 'none';
        edit.style.display = 'flex';
        
        const id = document.getElementById('modalOrderId').textContent.replace('#', '');
        const o = window.AppData.orders.find(x => String(x.id) === String(id));
        if(!o) return;
        
        window.editingOrderState = JSON.parse(JSON.stringify(o)); // Deep clone
        
        document.getElementById('editOrderCustName').value = o.customer || '';
        document.getElementById('editOrderCustPhone').value = o.phone || '';
        document.getElementById('editOrderCustAddress').value = o.address || '';
        
        renderEditableItems();
    }
}

window.renderEditableItems = function() {
    const itemsList = document.getElementById('modalOrderItems');
    itemsList.innerHTML = '';
    
    if(!window.editingOrderState.items) window.editingOrderState.items = [];
    
    window.editingOrderState.items.forEach((item, index) => {
        const tr = document.createElement('tr');
        const pId = typeof item.id === 'object' ? item.id.id : item.id;
        
        const inputStyle = "background:var(--bg-main); color:var(--text-main); border:1px solid var(--border-color); border-radius:4px;";
        
        tr.innerHTML = `
            <td>
                <input type="text" style="width:100%; padding:0.4rem; font-size:0.85rem; ${inputStyle}" value="${item.title || ''}" onchange="window.editingOrderState.items[${index}].title = this.value">
                <input type="text" style="width:100%; padding:0.4rem; font-size:0.75rem; margin-top:0.4rem; ${inputStyle}" value="${pId || ''}" placeholder="SKU" onchange="window.editingOrderState.items[${index}].id = this.value">
            </td>
            <td>
                <input type="number" style="width:70px; padding:0.4rem; font-size:0.85rem; ${inputStyle}" value="${item.price || 0}" onchange="window.editingOrderState.items[${index}].price = Number(this.value); renderEditableItems()">
            </td>
            <td>
                <input type="number" style="width:50px; padding:0.4rem; font-size:0.85rem; ${inputStyle}" value="${item.qty || 1}" onchange="window.editingOrderState.items[${index}].qty = Number(this.value); renderEditableItems()">
            </td>
            <td style="text-align:right;">
                ${(item.price || 0) * (item.qty || 1)}
                <button type="button" onclick="removeOrderItem(${index})" style="background:none; border:none; color:var(--danger); cursor:pointer; margin-left:0.5rem;" title="Remove Item"><i data-lucide="trash-2" style="width:14px; height:14px;"></i></button>
            </td>
        `;
        itemsList.appendChild(tr);
    });
    
    // Add Item button row
    const trAdd = document.createElement('tr');
    trAdd.innerHTML = `
        <td colspan="4" style="text-align:center; padding-top:1rem;">
            <button type="button" class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="addOrderItem()">+ Add New Book/Product</button>
        </td>
    `;
    itemsList.appendChild(trAdd);
    
    if(window.lucide) lucide.createIcons();
}

window.addOrderItem = function() {
    window.editingOrderState.items.push({ id: '', title: 'New Item', price: 0, qty: 1 });
    renderEditableItems();
}

window.removeOrderItem = function(index) {
    window.editingOrderState.items.splice(index, 1);
    renderEditableItems();
}

window.saveOrderEdits = async function() {
    const id = document.getElementById('modalOrderId').textContent.replace('#', '');
    const name = document.getElementById('editOrderCustName').value;
    const phone = document.getElementById('editOrderCustPhone').value;
    const address = document.getElementById('editOrderCustAddress').value;
    
    let subtotal = 0;
    window.editingOrderState.items.forEach(item => {
        subtotal += (Number(item.price) || 0) * (Number(item.qty) || 1);
    });
    
    // Keep shipping hardcoded or extracted from state
    const shipping = Number(window.editingOrderState.shipping || 150);
    const total = subtotal + shipping;
    
    try {
        await db.collection("orders").doc(id).update({
            customer: name,
            phone: phone,
            address: address,
            items: window.editingOrderState.items,
            total: total
        });
        alert('Order completely updated including items!');
        
        // Hide edit mode
        const info = document.getElementById('modalCustomerInfo');
        const edit = document.getElementById('modalCustomerEdit');
        info.style.display = 'block';
        edit.style.display = 'none';
        
    } catch(e) {
        alert("Error saving edits: " + e.message);
    }
}
