/* ============================================================
   Study Pack - WooCommerce REST API Integration Bridge
   ============================================================ */

const WC_CONFIG = {
    storeUrl: 'https://api.studypack.taleemihub.com',
    consumerKey: 'ck_9d3ebbf59738bb9cb7a3021067c90893476d32d7',
    consumerSecret: 'cs_75d5b1183e7985468ab5e374fc9be4ed0a5e2b3f'
};

/**
 * Syncs an order placed on the frontend directly into WordPress WooCommerce backend
 * @param {Object} orderData 
 * @returns {Promise<Object>} Created WooCommerce Order Object
 */
window.syncOrderToWooCommerce = async function(orderData) {
    try {
        const authHeader = 'Basic ' + btoa(WC_CONFIG.consumerKey + ':' + WC_CONFIG.consumerSecret);
        
        // Parse name into first and last name
        const nameParts = (orderData.customer || 'Customer').trim().split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Format line items
        const lineItems = (orderData.items || []).map(item => {
            const itemObj = {
                name: item.title || item.name || 'Product',
                quantity: Number(item.qty) || 1,
                total: String((Number(item.price) || 0) * (Number(item.qty) || 1))
            };
            if (item.wcId || item.productId || item.wc_id) {
                itemObj.product_id = Number(item.wcId || item.productId || item.wc_id);
            }
            if (item.sku) {
                itemObj.sku = String(item.sku);
            }
            return itemObj;
        });

        const orderPayload = {
            payment_method: (orderData.paymentMethod || 'cod').toLowerCase(),
            payment_method_title: orderData.paymentMethodTitle || 'Cash on Delivery',
            set_paid: false,
            status: 'pending',
            billing: {
                first_name: firstName,
                last_name: lastName,
                address_1: orderData.address || '',
                city: orderData.city || 'Karachi',
                state: orderData.province || 'Sindh',
                country: 'PK',
                email: orderData.email || 'customer@taleemihub.com',
                phone: orderData.phone || ''
            },
            shipping: {
                first_name: firstName,
                last_name: lastName,
                address_1: orderData.address || '',
                city: orderData.city || 'Karachi',
                state: orderData.province || 'Sindh',
                country: 'PK'
            },
            line_items: lineItems,
            customer_note: `Weight note: ${orderData.shippingNote || 'Weight ke mutabiq'}. Order source: StudyPack New Frontend`
        };

        const res = await fetch(`${WC_CONFIG.storeUrl}/wp-json/wc/v3/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify(orderPayload)
        });

        if (res.ok) {
            const wcOrder = await res.json();
            console.log("Successfully synced order to WooCommerce! WC ID:", wcOrder.id);
            return wcOrder;
        } else {
            const errText = await res.text();
            console.warn("WooCommerce sync response non-ok:", res.status, errText);
            return null;
        }

    } catch (err) {
        console.warn("WooCommerce API sync network error (handled gracefully):", err);
        return null;
    }
};
