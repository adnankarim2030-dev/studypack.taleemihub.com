
// Preloader Immediate Dismissal
function dismissPreloader() {
    const pl = document.getElementById('preloader');
    if (pl) {
        pl.classList.add('hide');
        pl.style.opacity = '0';
        pl.style.visibility = 'hidden';
        pl.style.pointerEvents = 'none';
        setTimeout(() => { if (pl) pl.style.display = 'none'; }, 400);
    }
}
document.addEventListener('DOMContentLoaded', dismissPreloader);
window.addEventListener('load', dismissPreloader);
setTimeout(dismissPreloader, 100);
setTimeout(dismissPreloader, 500);
setTimeout(dismissPreloader, 1200);

/* ========================================================
   STUDY PACK CENTRAL STORE & CART ENGINE (GLOBAL & PERSISTENT)
   ======================================================== */

// Global Helpers
window.money = function(n) {
    const num = Number(n) || 0;
    return 'PKR ' + num.toLocaleString();
};

window.starString = function(r) {
    const full = Math.round(Number(r) || 5);
    return '★'.repeat(Math.max(0, Math.min(5, full))) + '☆'.repeat(Math.max(0, 5 - full));
};

// Global Cart State
window.cart = [];
try {
    window.cart = JSON.parse(localStorage.getItem('edubooks_cart') || '[]');
} catch(e) {
    window.cart = [];
}

window.saveCart = function() {
    try {
        localStorage.setItem('edubooks_cart', JSON.stringify(window.cart));
    } catch(e) {}
};

// Global Robust findItem function
window.findItem = function(id) {
    const sId = String(id);
    
    // Check in BOOKS
    if (typeof BOOKS !== 'undefined' && Array.isArray(BOOKS)) {
        const found = BOOKS.find(x => String(x.id) === sId);
        if (found) return found;
    }
    // Check in SCRAPED_BOOKS
    if (typeof SCRAPED_BOOKS !== 'undefined' && Array.isArray(SCRAPED_BOOKS)) {
        const found = SCRAPED_BOOKS.find(x => String(x.id) === sId);
        if (found) return found;
    }
    // Check in TOYS
    if (typeof TOYS !== 'undefined' && Array.isArray(TOYS)) {
        const found = TOYS.find(x => String(x.id) === sId);
        if (found) return found;
    }
    if (typeof SCRAPED_TOYS !== 'undefined' && Array.isArray(SCRAPED_TOYS)) {
        const found = SCRAPED_TOYS.find(x => String(x.id) === sId);
        if (found) return found;
    }
    // Check in STATIONERY
    if (typeof STATIONERY !== 'undefined' && Array.isArray(STATIONERY)) {
        const found = STATIONERY.find(x => String(x.id) === sId);
        if (found) return found;
    }
    if (typeof SCRAPED_STATIONERY !== 'undefined' && Array.isArray(SCRAPED_STATIONERY)) {
        const found = SCRAPED_STATIONERY.find(x => String(x.id) === sId);
        if (found) return found;
    }
    // Check in SCRAPED_AFAQ
    if (typeof SCRAPED_AFAQ !== 'undefined' && Array.isArray(SCRAPED_AFAQ)) {
        const found = SCRAPED_AFAQ.find(x => String(x.id) === sId);
        if (found) return found;
    }
    // Check in window.currentBooks
    if (typeof window.currentBooks !== 'undefined' && Array.isArray(window.currentBooks)) {
        const found = window.currentBooks.find(x => String(x.id) === sId);
        if (found) return found;
    }
    return null;
};

// Global addToCart
window.addToCart = function(id) {
    const sId = String(id);
    const item = window.cart.find(c => String(c.id) === sId);
    
    if (item) {
        item.qty = (Number(item.qty) || 1) + 1;
    } else {
        const b = window.findItem(sId);
        if (!b) {
            console.warn("Product not found in catalog for id:", sId);
            return;
        }
        window.cart.push({
            id: String(b.id),
            title: b.title || b.name || 'Study Pack Item',
            price: Number(b.price || 0),
            img: b.img || 'assets/images/logo.png',
            cls: b.cls || 'General',
            subj: b.subj || 'General',
            pub: b.pub || '',
            qty: 1
        });
    }
    
    window.saveCart();
    window.renderCart();
    window.showToast('Cart mein shamil ho gaya! 🛒');
    
    const btn = document.getElementById('cartBtn');
    if (btn && btn.animate) {
        btn.animate([{transform:'scale(1)'},{transform:'scale(1.25)'},{transform:'scale(1)'}], {duration:350});
    }
};

window.changeQty = function(id, delta) {
    const sId = String(id);
    const item = window.cart.find(c => String(c.id) === sId);
    if (!item) return;
    
    item.qty = (Number(item.qty) || 1) + delta;
    if (item.qty <= 0) {
        window.cart = window.cart.filter(c => String(c.id) !== sId);
    }
    window.saveCart();
    window.renderCart();
};

window.removeItem = function(id) {
    const sId = String(id);
    window.cart = window.cart.filter(c => String(c.id) !== sId);
    window.saveCart();
    window.renderCart();
    window.showToast('Item cart se hata diya gaya');
};

window.renderCart = function() {
    const wrap = document.getElementById('cartItems');
    const empty = document.getElementById('cartEmpty');
    const count = window.cart.reduce((s, c) => s + (Number(c.qty) || 1), 0);
    
    // Update badge count
    document.querySelectorAll('#cartCount, .cart-count-badge').forEach(el => {
        el.textContent = count;
    });

    if (!wrap) return;

    if (window.cart.length === 0) {
        wrap.innerHTML = `<div style="text-align:center; padding:40px 20px; color:#64748B;">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px; opacity:0.6;"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
            <div style="font-size:15px; font-weight:700; color:#0F172A; margin-bottom:4px;">Aapka Cart Khali Hai</div>
            <div style="font-size:12.5px;">Kitabein talaash karein aur Add to Cart karein.</div>
        </div>`;
    } else {
        wrap.innerHTML = window.cart.map(c => `
          <div class="cart-item" style="display:flex; gap:10px; padding:12px 0; border-bottom:1px solid #F1F5F9; align-items:center;">
            <img src="${c.img || 'assets/images/logo.png'}" alt="${c.title}" style="width:48px; height:48px; object-fit:contain; border-radius:6px; background:#F8FAFC; padding:2px; border:1px solid #E2E8F0;" onerror="this.src='assets/images/logo.png'">
            <div style="flex:1; min-width:0;">
              <div style="font-size:13px; font-weight:700; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.title}</div>
              <div style="font-size:11.5px; color:#64748B;">${c.cls} • ${c.subj}</div>
              <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
                <button onclick="window.changeQty('${c.id}', -1)" style="width:24px; height:24px; border-radius:4px; border:1px solid #CBD5E1; background:#fff; cursor:pointer; font-weight:700;">-</button>
                <span style="font-size:12px; font-weight:700; min-width:14px; text-align:center;">${c.qty}</span>
                <button onclick="window.changeQty('${c.id}', 1)" style="width:24px; height:24px; border-radius:4px; border:1px solid #CBD5E1; background:#fff; cursor:pointer; font-weight:700;">+</button>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:13px; font-weight:800; color:#0F172A;">${window.money(c.price * c.qty)}</div>
              <button onclick="window.removeItem('${c.id}')" style="background:none; border:none; color:#EF4444; font-size:11px; font-weight:600; cursor:pointer; margin-top:4px;">Remove</button>
            </div>
          </div>
        `).join('');
    }

    const sub = window.cart.reduce((s, c) => s + (Number(c.price) || 0) * (Number(c.qty) || 1), 0);
    
    const elSub = document.getElementById('sumSub');
    const elShip = document.getElementById('sumShip');
    const elTotal = document.getElementById('sumTotal');

    if (elSub) elSub.textContent = window.money(sub);
    if (elShip) elShip.textContent = sub === 0 ? 'PKR 0' : 'As per Weight / Distance';
    if (elTotal) elTotal.textContent = sub === 0 ? 'PKR 0' : window.money(sub) + ' (+ Delivery)';
};

window.openCart = function() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer) drawer.classList.add('show');
    if (overlay) overlay.classList.add('show');
    window.renderCart();
};

window.closeCartFn = function() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer) drawer.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
};

// Global Toast
let __toastTimer;
window.showToast = function(msg) {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        t.className = 'toast';
        t.innerHTML = '<span id="toastMsg"></span>';
        document.body.appendChild(t);
    }
    const msgEl = document.getElementById('toastMsg') || t;
    msgEl.textContent = msg;
    t.classList.add('show');
    clearTimeout(__toastTimer);
    __toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
};

// Global Quick View
window.openQuickView = function(id) {
    const b = window.findItem(id);
    if (!b) return;
    
    let modal = document.getElementById('qvModal');
    let overlay = document.getElementById('qvOverlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'qvOverlay';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = '<div class="qv-modal" id="qvModal"></div>';
        document.body.appendChild(overlay);
        modal = document.getElementById('qvModal');
        overlay.addEventListener('click', (e) => { if(e.target === overlay) window.closeQV(); });
    }
    
    const priceStr = window.money(b.price);
    const oldStr = b.old ? window.money(b.old) : '';
    
    modal.innerHTML = `
      <button class="modal-close" onclick="window.closeQV()" style="position:absolute; top:14px; right:14px; background:#fff; border:1px solid #CBD5E1; border-radius:50%; width:32px; height:32px; cursor:pointer; display:flex; align-items:center; justify-content:center;">&times;</button>
      <div style="display:flex; gap:20px; flex-wrap:wrap; padding:10px;">
        <div style="flex:1; min-width:200px; display:flex; align-items:center; justify-content:center; background:#F8FAFC; border-radius:12px; padding:20px;">
          <img src="${b.img || 'assets/images/logo.png'}" alt="${b.title}" style="max-height:220px; max-width:100%; object-fit:contain;" onerror="this.src='assets/images/logo.png'">
        </div>
        <div style="flex:1.4; min-width:240px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <span style="font-size:11px; font-weight:700; color:#1565C0; text-transform:uppercase;">${b.cls} • ${b.subj}</span>
            <h3 style="font-size:18px; font-weight:800; color:#0F172A; margin:6px 0 4px 0;">${b.title}</h3>
            <div style="font-size:12.5px; color:#64748B; margin-bottom:12px;">by ${b.author || 'Study Pack'} • ${b.pub || ''}</div>
            <div style="font-size:20px; font-weight:800; color:#0F172A; margin-bottom:16px;">${priceStr} ${oldStr ? `<span style="font-size:13px; color:#94A3B8; text-decoration:line-through;">${oldStr}</span>` : ''}</div>
          </div>
          <div style="display:flex; gap:10px;">
            <button onclick="window.addToCart('${b.id}'); window.closeQV();" style="flex:1; padding:12px; background:#0F172A; color:#fff; border:none; border-radius:8px; font-weight:700; cursor:pointer;">Add to Cart</button>
            <button onclick="window.addToCart('${b.id}'); window.closeQV(); window.openCart();" style="flex:1; padding:12px; background:#1565C0; color:#fff; border:none; border-radius:8px; font-weight:700; cursor:pointer;">Buy Now</button>
          </div>
        </div>
      </div>
    `;
    
    overlay.classList.add('show');
};

window.closeQV = function() {
    const overlay = document.getElementById('qvOverlay');
    if (overlay) overlay.classList.remove('show');
};

// Initialize listeners on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    window.renderCart();
    
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartBtn) cartBtn.addEventListener('click', window.openCart);
    if (closeCart) closeCart.addEventListener('click', window.closeCartFn);
    if (cartOverlay) cartOverlay.addEventListener('click', window.closeCartFn);
});
