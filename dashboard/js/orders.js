/* ============================================================
   Orders module — list/search/filter, status update, view/edit
   modal, print invoice, pagination.
   ============================================================ */

const ORDERS_PER_PAGE = 15;
let __ordersPage = 1;

window.renderOrders = function() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    const orders = window.AppData.orders || [];
    const search = (document.getElementById('orderSearch')?.value || '').toLowerCase();
    const filterStatus = document.getElementById('orderStatusFilter')?.value;

    let filtered = orders;
    if (search) {
        filtered = filtered.filter(o =>
            (o.id && String(o.id).toLowerCase().includes(search)) ||
            (o.customer && o.customer.toLowerCase().includes(search)) ||
            (o.phone && o.phone.toLowerCase().includes(search))
        );
    }
    if (filterStatus) filtered = filtered.filter(o => o.status === filterStatus);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ORDERS_PER_PAGE));
    if (__ordersPage > totalPages) __ordersPage = totalPages;
    const pageItems = filtered.slice((__ordersPage - 1) * ORDERS_PER_PAGE, __ordersPage * ORDERS_PER_PAGE);

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i data-lucide="shopping-cart"></i><p>No orders found</p></div></td></tr>`;
    } else {
        tbody.innerHTML = pageItems.map(o => {
            const dateStr = o.date ? new Date(o.date).toLocaleDateString('en-GB') : 'N/A';
            return `
            <tr>
                <td><div style="font-weight:700;" class="mono">#${escapeHtml(o.id)}</div><div class="text-muted" style="font-size:0.75rem;">${dateStr}</div></td>
                <td><div style="font-weight:600;">${escapeHtml(o.customer || 'Unknown')}</div><div class="text-muted" style="font-size:0.75rem;">${escapeHtml(o.phone || '')}</div></td>
                <td>${(o.items || []).length} items</td>
                <td style="font-weight:700;">${money(o.total)}</td>
                <td>
                    <select onchange="updateOrderStatus('${o.id}', this.value)" style="padding:0.4rem 0.6rem; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-main); font-size:0.85rem;">
                        <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Completed" ${o.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td style="text-align:right;">
                    <button class="icon-btn-sm" onclick="viewOrder('${o.id}')" title="View"><i data-lucide="eye"></i></button>
                    <button class="icon-btn-sm" onclick="printInvoice('${o.id}')" title="Print Invoice"><i data-lucide="printer"></i></button>
                </td>
            </tr>`;
        }).join('');
    }

    renderPagination('ordersPagination', filtered.length, __ordersPage, totalPages, (p) => { __ordersPage = p; window.renderOrders(); });
    lucide.createIcons();
};

document.getElementById('orderSearch')?.addEventListener('input', () => { __ordersPage = 1; window.renderOrders(); });
document.getElementById('orderStatusFilter')?.addEventListener('change', () => { __ordersPage = 1; window.renderOrders(); });

window.updateOrderStatus = async function(id, newStatus) {
    try {
        await db.collection('orders').doc(id).update({ status: newStatus });
        showToast('Order status updated to ' + newStatus);
    } catch (e) {
        showToast('Error updating order: ' + e.message, 'error');
    }
};

window.viewOrder = function(id) {
    const o = window.AppData.orders.find(x => String(x.id) === String(id));
    if (!o) return;

    document.getElementById('modalOrderId').textContent = `#${o.id}`;
    document.getElementById('modalOrderDate').textContent = o.date ? new Date(o.date).toLocaleString('en-GB') : 'N/A';

    document.getElementById('modalCustomerInfo').innerHTML = `
        <p><strong>Name:</strong> ${escapeHtml(o.customer || 'N/A')}</p>
        <p><strong>Email:</strong> ${escapeHtml(o.email || 'N/A')}</p>
        <p><strong>Phone:</strong> ${escapeHtml(o.phone || 'N/A')}</p>
        <p><strong>Address:</strong> ${escapeHtml(o.address || 'N/A')}, ${escapeHtml(o.city || '')}</p>
        ${o.notes ? `<p><strong>Notes:</strong> ${escapeHtml(o.notes)}</p>` : ''}
    `;
    document.getElementById('modalCustomerInfo').style.display = 'block';
    document.getElementById('modalCustomerEdit').style.display = 'none';
    document.getElementById('saveOrderEditsBtn').style.display = 'none';

    const itemsList = document.getElementById('modalOrderItems');
    let subtotal = 0;
    if (o.items && o.items.length > 0) {
        itemsList.innerHTML = o.items.map(item => {
            const pId = typeof item.id === 'object' ? item.id.id : item.id;
            const price = Number(item.price || 0);
            const qty = Number(item.qty || 1);
            subtotal += price * qty;
            return `
            <tr>
                <td><div style="font-weight:500;">${escapeHtml(item.title || 'Product')}</div><div class="text-muted mono" style="font-size:0.75rem;">SKU: ${escapeHtml(pId || '')}</div></td>
                <td>${money(price)}</td>
                <td>x${qty}</td>
                <td style="text-align:right;">${money(price * qty)}</td>
            </tr>`;
        }).join('');
    } else {
        itemsList.innerHTML = `<tr><td colspan="4" style="text-align:center;">No items</td></tr>`;
    }

    document.getElementById('modalSubtotal').textContent = money(subtotal);
    const shipping = Number(o.shipping) || 0;
    const taxAmount = Number(o.taxAmount) || 0;
    document.getElementById('modalShipping').textContent = money(shipping);
    
    if (taxAmount > 0) {
        document.getElementById('modalTaxDiv').style.display = 'block';
        document.getElementById('modalTaxNote').textContent = escapeHtml(o.taxNote || 'Tax');
        document.getElementById('modalTaxAmount').textContent = money(taxAmount);
    } else {
        document.getElementById('modalTaxDiv').style.display = 'none';
    }
    
    document.getElementById('modalTotal').textContent = money(o.total || (subtotal + shipping + taxAmount));
    
    document.getElementById('modalFinancialsDisplay').style.display = 'flex';
    document.getElementById('modalFinancialsEdit').style.display = 'none';

    document.getElementById('orderModal').classList.add('show');
    lucide.createIcons();
};

window.closeOrderModal = function() {
    document.getElementById('orderModal').classList.remove('show');
};

window.editingOrderState = null;

window.toggleOrderEdit = function() {
    const info = document.getElementById('modalCustomerInfo');
    const edit = document.getElementById('modalCustomerEdit');
    const saveBtn = document.getElementById('saveOrderEditsBtn');

    if (edit.style.display === 'none' || !edit.style.display) {
        const id = document.getElementById('modalOrderId').textContent.replace('#', '');
        const o = window.AppData.orders.find(x => String(x.id) === String(id));
        if (!o) return;
        window.editingOrderState = JSON.parse(JSON.stringify(o));

        info.style.display = 'none';
        edit.style.display = 'flex';
        saveBtn.style.display = 'inline-flex';
        
        document.getElementById('modalFinancialsDisplay').style.display = 'none';
        document.getElementById('modalFinancialsEdit').style.display = 'flex';

        document.getElementById('editOrderCustName').value = o.customer || '';
        document.getElementById('editOrderCustPhone').value = o.phone || '';
        document.getElementById('editOrderCustAddress').value = o.address || '';
        
        document.getElementById('editOrderShipping').value = Number(o.shipping) || 0;
        document.getElementById('editOrderTaxNote').value = o.taxNote || '';
        document.getElementById('editOrderTaxAmount').value = Number(o.taxAmount) || 0;
        
        renderEditableItems();
    } else {
        info.style.display = 'block';
        edit.style.display = 'none';
        saveBtn.style.display = 'none';
        document.getElementById('modalFinancialsDisplay').style.display = 'flex';
        document.getElementById('modalFinancialsEdit').style.display = 'none';
        const id = document.getElementById('modalOrderId').textContent.replace('#', '');
        viewOrder(id);
    }
};

window.renderEditableItems = function() {
    const itemsList = document.getElementById('modalOrderItems');
    if (!window.editingOrderState.items) window.editingOrderState.items = [];

    itemsList.innerHTML = window.editingOrderState.items.map((item, index) => {
        const pId = typeof item.id === 'object' ? item.id.id : item.id;
        return `
        <tr>
            <td>
                <input type="text" style="width:100%; padding:0.4rem; font-size:0.85rem; background:var(--bg-main); color:var(--text-main); border:1px solid var(--border-color); border-radius:6px;" value="${escapeHtml(item.title || '')}" onchange="window.editingOrderState.items[${index}].title = this.value">
                <input type="text" style="width:100%; padding:0.4rem; font-size:0.75rem; margin-top:0.4rem; background:var(--bg-main); color:var(--text-main); border:1px solid var(--border-color); border-radius:6px;" value="${escapeHtml(pId || '')}" placeholder="SKU" onchange="window.editingOrderState.items[${index}].id = this.value">
            </td>
            <td><input type="number" style="width:80px; padding:0.4rem; font-size:0.85rem; background:var(--bg-main); color:var(--text-main); border:1px solid var(--border-color); border-radius:6px;" value="${item.price || 0}" onchange="window.editingOrderState.items[${index}].price = Number(this.value); renderEditableItems()"></td>
            <td><input type="number" style="width:60px; padding:0.4rem; font-size:0.85rem; background:var(--bg-main); color:var(--text-main); border:1px solid var(--border-color); border-radius:6px;" value="${item.qty || 1}" onchange="window.editingOrderState.items[${index}].qty = Number(this.value); renderEditableItems()"></td>
            <td style="text-align:right;">
                ${money((item.price || 0) * (item.qty || 1))}
                <button type="button" onclick="removeOrderItem(${index})" style="background:none; border:none; color:var(--danger); cursor:pointer; margin-left:0.5rem;"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
            </td>
        </tr>`;
    }).join('') + `
        <tr><td colspan="4" style="text-align:center; padding-top:1rem;">
            <button type="button" class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="addOrderItem()">+ Add Item</button>
        </td></tr>`;

    lucide.createIcons();
};

window.addOrderItem = function() {
    window.editingOrderState.items.push({ id: '', title: 'New Item', price: 0, qty: 1 });
    renderEditableItems();
};
window.removeOrderItem = function(index) {
    window.editingOrderState.items.splice(index, 1);
    renderEditableItems();
};

window.saveOrderEdits = async function() {
    const id = document.getElementById('modalOrderId').textContent.replace('#', '');
    const name = document.getElementById('editOrderCustName').value;
    const phone = document.getElementById('editOrderCustPhone').value;
    const address = document.getElementById('editOrderCustAddress').value;

    const shipping = Number(document.getElementById('editOrderShipping').value) || 0;
    const taxNote = document.getElementById('editOrderTaxNote').value.trim();
    const taxAmount = Number(document.getElementById('editOrderTaxAmount').value) || 0;

    let subtotal = 0;
    window.editingOrderState.items.forEach(item => { subtotal += (Number(item.price) || 0) * (Number(item.qty) || 1); });
    const total = subtotal + shipping + taxAmount;

    try {
        await db.collection('orders').doc(id).update({
            customer: name, phone: phone, address: address,
            items: window.editingOrderState.items, 
            shipping: shipping, taxNote: taxNote, taxAmount: taxAmount,
            total: total
        });
        showToast('Order updated');
        
        // update local state so UI updates immediately
        const o = window.AppData.orders.find(x => String(x.id) === String(id));
        if (o) {
            o.customer = name; o.phone = phone; o.address = address;
            o.items = window.editingOrderState.items;
            o.shipping = shipping; o.taxNote = taxNote; o.taxAmount = taxAmount;
            o.total = total;
        }
        
        toggleOrderEdit();
    } catch (e) {
        showToast('Error saving edits: ' + e.message, 'error');
    }
};

window.printInvoice = function(id) {
    const o = window.AppData.orders.find(x => String(x.id) === String(id));
    if (!o) return;

    let itemsHtml = '';
    (o.items || []).forEach(item => {
        itemsHtml += `
            <tr>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${escapeHtml(item.title || 'Product')}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${item.price || 0}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${item.qty || 1}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd; text-align:right;">${(item.price || 0) * (item.qty || 1)}</td>
            </tr>`;
    });

    const printWin = window.open('', '', 'width=800,height=600');
    printWin.document.write(`
        <html><head><title>Invoice #${o.id}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.15); }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #FCA311; padding-bottom: 20px; }
            .header-left h2 { margin: 0; font-size: 28px; color: #0B132B; text-transform: uppercase; }
            .invoice-title { font-size: 32px; font-weight: bold; color: #0B132B; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th { text-align: left; padding: 12px; background: #0B132B; color: white; }
            .totals-table { width: 300px; margin-left: auto; margin-top: 30px; }
            .totals-table td { border: none; padding: 5px 12px; }
            .grand-total { font-size: 20px; font-weight: bold; border-top: 2px solid #0B132B !important; color: #0B132B; }
            .footer { margin-top: 50px; text-align: center; color: #777; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; }
        </style></head>
        <body>
            <div class="invoice-box">
                <div class="header">
                    <div class="header-left" style="display:flex; flex-direction:column; align-items:flex-start;">
                        <img src="https://studypack-taleemihub.vercel.app/assets/images/studypack_logo.png" style="height:60px; margin-bottom:10px;" alt="Study Pack Logo">
                        <div>
                            <h2 style="margin:0; font-size:24px; color:#0B132B; text-transform:uppercase;">Study Pack</h2>
                            <p style="margin:2px 0 0 0; color:#777; font-size:14px;">Taleemihub.com</p>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div class="invoice-title">INVOICE</div>
                        <p><strong>Order #:</strong> ${o.id}</p>
                        <p><strong>Date:</strong> ${o.date ? new Date(o.date).toLocaleDateString('en-GB') : ''}</p>
                    </div>
                </div>
                <div><strong style="color:#0B132B; font-size:18px;">Bill To:</strong><br>
                    ${escapeHtml(o.customer || 'Customer')}<br>${escapeHtml(o.address || '')}<br>${escapeHtml(o.city || '')}<br>${escapeHtml(o.phone || '')}
                </div>
                <table><thead><tr><th>Item</th><th>Price</th><th>Qty</th><th style="text-align:right;">Total</th></tr></thead><tbody>${itemsHtml}</tbody></table>
                <table class="totals-table">
                    <tr><td>Subtotal:</td><td style="text-align:right;">Rs. ${(o.total || 0) - (Number(o.shipping) || 0) - (Number(o.taxAmount) || 0)}</td></tr>
                    ${(Number(o.taxAmount) || 0) > 0 ? `<tr><td>Tax (${escapeHtml(o.taxNote || '')}):</td><td style="text-align:right;">Rs. ${o.taxAmount}</td></tr>` : ''}
                    <tr><td>Shipping:</td><td style="text-align:right;">Rs. ${o.shipping || 0}</td></tr>
                    <tr><td class="grand-total">Total:</td><td class="grand-total" style="text-align:right;">Rs. ${o.total}</td></tr>
                </table>
                <div class="footer">Thank you for your business!<br>support@taleemihub.com</div>
            </div>
            <script>window.onload = function(){ window.print(); }<\/script>
        </body></html>
    `);
    printWin.document.close();
};

window.exportOrdersCSV = function() {
    const orders = window.AppData.orders || [];
    if (orders.length === 0) return showToast('No orders to export', 'error');
    let csv = 'Order ID,Date,Customer,Phone,Status,Subtotal,Tax,Shipping,Total\n';
    orders.forEach(o => {
        const tax = Number(o.taxAmount) || 0;
        const ship = Number(o.shipping) || 0;
        const total = Number(o.total) || 0;
        const subtotal = total - tax - ship;
        csv += `${o.id},${o.date ? new Date(o.date).toLocaleDateString() : ''},"${(o.customer || '').replace(/"/g, '""')}","${o.phone || ''}",${o.status},${subtotal},${tax},${ship},${total}\n`;
    });
    downloadCSV(csv, `Orders_Export_${new Date().toISOString().split('T')[0]}.csv`);
};
