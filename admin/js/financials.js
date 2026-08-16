
function renderFinancials() {
    const orders = window.AppData.orders || [];
    const products = window.AppData.products || [];
    
    let totalRevenue = 0;
    let totalProfit = 0;
    let validOrdersCount = 0;
    
    // Map product purchase prices
    const purchasePrices = {};
    products.forEach(p => {
        if(p.id) purchasePrices[p.id] = Number(p.purchase_price || 0);
    });
    
    orders.forEach(o => {
        if(o.status === 'Cancelled') return; // Exclude cancelled
        
        const rev = Number(o.total || 0);
        totalRevenue += rev;
        validOrdersCount++;
        
        // Calculate costs
        let orderCost = 0;
        if(o.items) {
            o.items.forEach(item => {
                const pid = typeof item.id === 'object' ? item.id.id : item.id;
                const cost = purchasePrices[pid] || 0;
                orderCost += (cost * (item.qty || 1));
            });
        }
        totalProfit += (rev - orderCost);
    });
    
    const aov = validOrdersCount > 0 ? (totalRevenue / validOrdersCount) : 0;
    
    document.getElementById('finTotalRevenue').textContent = window.money ? window.money(totalRevenue) : totalRevenue;
    document.getElementById('finTotalProfit').textContent = window.money ? window.money(totalProfit) : totalProfit;
    document.getElementById('finAov').textContent = window.money ? window.money(aov.toFixed(0)) : aov.toFixed(0);
}

document.addEventListener('appDataLoaded', (e) => {
    if (document.getElementById('financials')?.classList.contains('active')) {
        renderFinancials();
    }
});
document.querySelector('.nav-item[data-view="financials"]')?.addEventListener('click', () => {
    setTimeout(renderFinancials, 100);
});
