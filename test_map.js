const fs = require('fs');

try {
  let mainJs = fs.readFileSync('assets/js/main.js', 'utf8');
  mainJs = mainJs.replace(/const BOOKS/g, 'var BOOKS');
  eval(mainJs);

  function money(n){ return 'Rs ' + (n ? n.toLocaleString() : ''); }
  function starString(r){ const full = Math.round(r); return '★'.repeat(full) + '☆'.repeat(5-full); }

  let list = BOOKS.filter(b => b.price <= 3000);
  let pageItems = list.slice(0, 9);
  
  let html = pageItems.map(b => `<div class="p-card" style="min-width:0; overflow:hidden;" data-id="${b.id}">
      <div class="p-cover-wrap">
        <div class="p-cover" style="background:${b.img ? '#fff' : (b.grad || 'var(--grey)')}; padding: ${b.img ? '0' : '10px'};">
          <div class="badges-row">
            ${b.tag==='best'?'<span class="pill best">Bestseller</span>':''}
            ${b.tag==='new'?'<span class="pill new">New</span>':''}
            ${b.old?'<span class="pill off">-'+Math.round(100-(b.price/b.old*100))+'%</span>':''}
          </div>
          <div class="quick-actions">
            <button class="qa-btn" title="Wishlist" onclick="showToast('Added to wishlist')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
            <button class="qa-btn" title="Quick View" onclick="openQuickView(${b.id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
            <button class="qa-btn" title="Compare" onclick="showToast('Added to compare')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v18M16 3v18M3 8h5M16 8h5M3 16h5M16 16h5"/></svg></button>
          </div>
          ${b.img ? `<img src="${b.img}" alt="${b.title}" style="width:100%; height:100%; object-fit:contain; border-radius:inherit; mix-blend-mode:multiply;">` : `<div class="p-title" style="text-align:center;">${b.title}</div>`}
        </div>
      </div>
      <div class="p-meta" style="min-width:0;"><span>${b.cls || 'Misc'}</span><span>${b.subj || 'General'}</span></div>
      <div class="p-name">${b.title}</div>
      <div class="p-author">by ${b.author || 'Study Pack'} ${b.pub ? '· ' + b.pub : ''}</div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:4px;">
        <div class="p-rating" style="margin-bottom:0;"><span class="stars">${starString(b.rating || 5)}</span><span class="rv">(${b.rv || 0})</span></div>
        <div class="p-stock" style="margin-bottom:0;"><span class="d" style="background:${b.stock!==false?'#2e7d32':'#c62828'}"></span>${b.stock!==false?'In Stock':'Out of Stock'}</div>
      </div>
      <div class="p-price-row">
        <div class="p-price"><span class="now">${money(b.price)}</span>${b.old?'<span class="old">'+money(b.old)+'</span>':''}</div>
      </div>
      <div class="p-actions" style="display:flex; flex-direction:column; gap:8px;">
        <button class="btn-cart" onclick="addToCart(${b.id})" style="width:100%; justify-content:center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg> Add to Cart</button>
        <button class="btn-buy" onclick="addToCart(${b.id}); openCart();" style="width:100%; justify-content:center;">Buy Now</button>
      </div>
    </div>`).join('');

  console.log("Success! HTML length:", html.length);
} catch(e) {
  console.error("Map Error:", e);
}
