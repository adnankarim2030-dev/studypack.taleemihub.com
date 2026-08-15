// Initialize Firebase v8 Compat
const firebaseConfig = {
    apiKey: "AIzaSyD3cl7bxjuLoILxck4di-w6fLw4aRXHb9M",
    authDomain: "study-pack-store.firebaseapp.com",
    projectId: "study-pack-store",
    storageBucket: "study-pack-store.firebasestorage.app",
    messagingSenderId: "346606609514",
    appId: "1:346606609514:web:31ca9e21967e6b1d4f5613"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const storage = firebase.storage();

// Global App State
window.AppData = {
    products: [],
    orders: [],
    coupons: [],
    customers: new Map(), // email -> customer data
    loaded: {
        products: false,
        orders: false
    }
};

// Listeners
function initFirebaseListeners() {
    db.collection("coupons").onSnapshot(snapshot => {
        window.AppData.coupons = snapshot.docs.map(doc => doc.data());
    });

    db.collection("products").onSnapshot(snapshot => {
        window.AppData.products = snapshot.docs.map(doc => doc.data());
        window.AppData.loaded.products = true;
        document.dispatchEvent(new CustomEvent('appDataLoaded', { detail: 'products' }));
    });

    db.collection("orders").onSnapshot(snapshot => {
        const orders = snapshot.docs.map(doc => doc.data());
        orders.sort((a,b) => b.date - a.date);
        window.AppData.orders = orders;
        
        // Extract Customers CRM logic
        const custMap = new Map();
        orders.forEach(o => {
            if(!o.email) return;
            if(!custMap.has(o.email)) {
                custMap.set(o.email, { email: o.email, name: o.customer, totalSpent: 0, orderCount: 0, lastOrder: o.date });
            }
            const c = custMap.get(o.email);
            c.totalSpent += (o.total || 0);
            c.orderCount++;
            if(o.date > c.lastOrder) c.lastOrder = o.date;
        });
        window.AppData.customers = custMap;
        
        window.AppData.loaded.orders = true;
        document.dispatchEvent(new CustomEvent('appDataLoaded', { detail: 'orders' }));
    });
}

// Start listening immediately
initFirebaseListeners();
