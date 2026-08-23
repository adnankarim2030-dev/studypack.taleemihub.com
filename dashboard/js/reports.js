/* ============================================================
   Financials & Reports module — revenue/profit/AOV, best sellers.
   ============================================================ */

window.renderReports = function() {
    const orders = window.AppData.orders || [];
    const products = window.AppData.products || [];

    const purchasePrices = {};
    products.forEach(p => { if (p.id) purchasePrices[p.id] = Number(p.purchase_price || 0); });

    let totalRevenue = 0, totalProfit = 0, validOrdersCount = 0;
    let totalTax = 0, totalShipping = 0;
    const qtyById = {}, revenueById = {};

    orders.forEach(o => {
        if (o.status === 'Cancelled') return;
        const rev = Number(o.total || 0);
        const tax = Number(o.taxAmount || 0);
        const ship = Number(o.shipping || 0);
        
        totalRevenue += rev;
        totalTax += tax;
        totalShipping += ship;
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
        // Profit is revenue minus cost, tax, and shipping (assuming shipping is a pass-through cost)
        totalProfit += (rev - orderCost - tax - ship);
    });

    const aov = validOrdersCount > 0 ? (totalRevenue / validOrdersCount) : 0;

    setText('finTotalRevenue', money(totalRevenue));
    setText('finTotalProfit', money(totalProfit));
    setText('finTotalTax', money(totalTax));
    setText('finTotalShipping', money(totalShipping));

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
