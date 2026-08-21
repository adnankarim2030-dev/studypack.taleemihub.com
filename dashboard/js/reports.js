/* ============================================================
   Financials & Reports module — revenue/profit/AOV, best sellers.
   ============================================================ */

window.renderReports = function() {
    const orders = window.AppData.orders || [];
    const products = window.AppData.products || [];

    const purchasePrices = {};
    products.forEach(p => { if (p.id) purchasePrices[p.id] = Number(p.purchase_price || 0); });

    let totalRevenue = 0, totalProfit = 0, validOrdersCount = 0;
    const qtyById = {}, revenueById = {};

    orders.forEach(o => {
        if (o.status === 'Cancelled') return;
        const rev = Number(o.total || 0);
        totalRevenue += rev;
        validOrdersCount++;

        let orderCost = 0;
        (o.items || []).forEach(item => {
            const pid = typeof item.id === 'object' ? item.id.id : item.id;
            const cost = purchasePrices[pid] || 0;
            const qty = Number(item.qty || 1);
            orderCost += cost * qty;

            if (pid) {
                qtyById[pid] = qtyById[pid] || { title: item.title || pid, qty: 0, revenue: 0 };
                qtyById[pid].qty += qty;
                qtyById[pid].revenue += Number(item.price || 0) * qty;
            }
        });
        totalProfit += (rev - orderCost);
    });

    const aov = validOrdersCount > 0 ? (totalRevenue / validOrdersCount) : 0;

    setText('finTotalRevenue', money(totalRevenue));
    setText('finTotalProfit', money(totalProfit));
    setText('finAov', money(aov.toFixed(0)));

    const best = Object.values(qtyById).sort((a, b) => b.qty - a.qty).slice(0, 10);
    const tbody = document.getElementById('bestSellersBody');
    if (tbody) {
        tbody.innerHTML = best.length === 0
            ? `<tr><td colspan="3"><div class="empty-state"><i data-lucide="bar-chart-3"></i><p>No sales data yet</p></div></td></tr>`
            : best.map(b => `
                <tr>
                    <td style="font-weight:600;">${escapeHtml(b.title)}</td>
                    <td>${b.qty}</td>
                    <td style="font-weight:700;">${money(b.revenue)}</td>
                </tr>`).join('');
        lucide.createIcons();
    }
};
