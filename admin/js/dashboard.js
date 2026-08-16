window.updateDashboardStats = function() {
    const orders = window.AppData.orders || [];
    const products = window.AppData.products || [];
    
    let totalSales = 0;
    let pending = 0;
    let outOfStock = 0;
    
    orders.forEach(o => {
        if(o.status !== 'Cancelled') totalSales += Number(o.total || 0);
        if(o.status === 'Pending') pending++;
    });
    
    products.forEach(p => {
        if(p.stock === false) outOfStock++;
    });
    
    const uniqueCust = new Set();
    orders.forEach(o => { if(o.phone) uniqueCust.add(o.phone); });

    if(document.getElementById('dashTotalSales')) document.getElementById('dashTotalSales').textContent = window.money ? window.money(totalSales) : totalSales;
    if(document.getElementById('dashTotalOrders')) document.getElementById('dashTotalOrders').textContent = orders.length;
    if(document.getElementById('dashPendingOrders')) document.getElementById('dashPendingOrders').textContent = pending;
    if(document.getElementById('dashTotalCustomers')) document.getElementById('dashTotalCustomers').textContent = uniqueCust.size;
    if(document.getElementById('dashTotalProducts')) document.getElementById('dashTotalProducts').textContent = products.length;
    if(document.getElementById('dashOutOfStock')) document.getElementById('dashOutOfStock').textContent = outOfStock;
}

document.addEventListener('appDataLoaded', window.updateDashboardStats);
