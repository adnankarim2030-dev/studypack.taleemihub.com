
function renderCustomers() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    
    const orders = window.AppData.orders || [];
    // Aggregate by phone number
    const custMap = {};
    orders.forEach(o => {
        if(!o.phone) return;
        if(!custMap[o.phone]) {
            custMap[o.phone] = { name: o.customer, phone: o.phone, totalSpent: 0, ordersCount: 0 };
        }
        custMap[o.phone].totalSpent += Number(o.total || 0);
        custMap[o.phone].ordersCount += 1;
        // Use most recent name
        custMap[o.phone].name = o.customer || custMap[o.phone].name;
    });
    
    const customers = Object.values(custMap).sort((a,b) => b.totalSpent - a.totalSpent);
    
    tbody.innerHTML = '';
    if (customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No customers found</td></tr>`;
        return;
    }
    
    customers.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:600;">${c.name || 'Unknown'}</td>
            <td>${c.phone}</td>
            <td>${c.ordersCount}</td>
            <td style="font-weight:600; color:var(--success);">${window.money ? window.money(c.totalSpent) : c.totalSpent}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.addEventListener('appDataLoaded', (e) => {
    if (document.getElementById('customers')?.classList.contains('active')) {
        renderCustomers();
    }
});
document.querySelector('.nav-item[data-view="customers"]')?.addEventListener('click', () => {
    setTimeout(renderCustomers, 100);
});
