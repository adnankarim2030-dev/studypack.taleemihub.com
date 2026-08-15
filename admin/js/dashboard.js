// Dashboard Analytics Logic
let revenueChartInstance = null;
let ordersChartInstance = null;

document.addEventListener('appDataLoaded', (e) => {
    // Only update if we are on dashboard view and both products & orders are loaded
    if (window.AppData.loaded.products && window.AppData.loaded.orders) {
        updateDashboardStats();
        renderCharts();
    }
});

window.updateDashboardStats = function() {
    const orders = window.AppData.orders;
    const products = window.AppData.products;

    // Calculations
    const totalSales = orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + (o.total || 0), 0);
    const today = new Date();
    today.setHours(0,0,0,0);
    const todaySales = orders.filter(o => o.status === 'Completed' && o.date >= today.getTime()).reduce((sum, o) => sum + (o.total || 0), 0);
    
    const pending = orders.filter(o => o.status === 'Pending').length;
    const processing = orders.filter(o => o.status === 'Processing').length;
    const completed = orders.filter(o => o.status === 'Completed').length;
    
    const lowStock = products.filter(p => p.stock === true).length; // Needs proper stock threshold logic later
    const outOfStock = products.filter(p => p.stock === false).length;

    // Update UI
    const setEl = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    
    setEl('statTotalSales', window.money(totalSales));
    setEl('statTodaySales', window.money(todaySales));
    setEl('statTotalOrders', orders.length);
    setEl('statPendingOrders', pending);
    setEl('statProcessingOrders', processing);
    setEl('statCompletedOrders', completed);
    setEl('statTotalCustomers', window.AppData.customers.size);
    setEl('statTotalProducts', products.length);
    setEl('statOutOfStock', outOfStock);
};

window.renderCharts = function() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#9ca3af' : '#6b7280';
    const gridColor = isDark ? '#374151' : '#e5e7eb';

    // Group sales by month for the revenue chart (Dummy grouping for now)
    const ctxRev = document.getElementById('revenueChart');
    if(ctxRev) {
        if(revenueChartInstance) revenueChartInstance.destroy();
        revenueChartInstance = new Chart(ctxRev, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [12000, 19000, 15000, 22000, 18000, 25000],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: textColor } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor } }
                }
            }
        });
    }

    const ctxOrd = document.getElementById('ordersChart');
    if(ctxOrd) {
        if(ordersChartInstance) ordersChartInstance.destroy();
        ordersChartInstance = new Chart(ctxOrd, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Processing', 'Pending'],
                datasets: [{
                    data: [
                        window.AppData.orders.filter(o=>o.status==='Completed').length,
                        window.AppData.orders.filter(o=>o.status==='Processing').length,
                        window.AppData.orders.filter(o=>o.status==='Pending').length
                    ],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { color: textColor } }
                },
                cutout: '75%'
            }
        });
    }
};
