window.exportOrdersCSV = function() {
    const orders = window.AppData.orders || [];
    if(orders.length === 0) return alert("No orders to export");
    
    let csv = "Order ID,Date,Customer,Phone,Status,Total\n";
    orders.forEach(o => {
        csv += `${o.id},${o.date ? new Date(o.date).toLocaleDateString() : ''},"${o.customer || ''}","${o.phone || ''}",${o.status},${o.total}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Orders_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

window.exportProductsCSV = function() {
    const products = window.AppData.products || [];
    if(products.length === 0) return alert("No products to export");
    
    let csv = "SKU,Title,Category,Purchase Price,Sale Price,In Stock\n";
    products.forEach(p => {
        csv += `${p.id},"${p.title || ''}","${p.category || ''}",${p.purchase_price || 0},${p.price || 0},${p.stock !== false ? 'Yes' : 'No'}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Inventory_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}
