/* ============ HELPERS ============ */
function money(n){ return 'PKR ' + n.toLocaleString(); }
function starString(r){ const full = Math.round(r); return '★'.repeat(full) + '☆'.repeat(5-full); }

/* ============ CART (persisted via localStorage, shared across pages) ============ */
let cart = [];
try{ cart = JSON.parse(localStorage.getItem('edubooks_cart') || '[]'); }catch(e){ cart = []; }

function saveCart(){ try{ localStorage.setItem('edubooks_cart', JSON.stringify(cart)); }catch(e){} }

function addToCart(id){
  const item = cart.find(c=>String(c.id)===String(id));
  if(item){ item.qty++; } else { const b = findItem(id); if(!b) return; cart.push({...b, qty:1}); }
  saveCart(); renderCart(); showToast('Added to cart');
  const btn = document.getElementById('cartBtn');
  if(btn) btn.animate([{transform:'scale(1)'},{transform:'scale(1.2)'},{transform:'scale(1)'}], {duration:350});
}
function changeQty(id, delta){
  const item = cart.find(c=>String(c.id)===String(id));
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0){ cart = cart.filter(c=>String(c.id)!==String(id)); }
  saveCart(); renderCart();
}
function removeItem(id){ cart = cart.filter(c=>String(c.id)!==String(id)); saveCart(); renderCart(); }

function renderCart(){
  const wrap = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  if(!wrap) return;
  const count = cart.reduce((s,c)=>s+c.qty,0);
  const countEl = document.getElementById('cartCount');
  if(countEl) countEl.textContent = count;

  if(cart.length===0){
    wrap.innerHTML = '';
    if(empty){ wrap.appendChild(empty); empty.style.display='block'; }
  } else {
    wrap.innerHTML = cart.map(c=>`
      <div class="cart-item">
        <div class="ci-cover" style="background:${c.img ? `url('${c.img}') center/cover no-repeat` : c.grad}"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
        <div class="ci-info">
          <div class="n">${c.title}</div>
          <div class="m">${c.cls} · ${c.subj}</div>
          <div class="ci-qty">
            <button onclick="changeQty('${c.id}',-1)">–</button>
            <span>${c.qty}</span>
            <button onclick="changeQty('${c.id}',1)">+</button>
          </div>
        </div>
        <div class="ci-price">
          <span class="p">${money(c.price*c.qty)}</span>
          <button onclick="removeItem('${c.id}')">Remove</button>
        </div>
      </div>
    `).join('');
  }
  const sub = cart.reduce((s,c)=>s+c.price*c.qty,0);
  const elSub = document.getElementById('sumSub'), elShip = document.getElementById('sumShip'), elTotal = document.getElementById('sumTotal');
  if(elSub) elSub.textContent = money(sub);
  if(elShip) elShip.textContent = sub===0 ? 'PKR 0' : 'As per Weight / Distance';
  if(elTotal) elTotal.textContent = sub===0 ? 'PKR 0' : money(sub) + ' (+ Delivery)';
}

function openCart(){ document.getElementById('cartDrawer').classList.add('show'); document.getElementById('cartOverlay').classList.add('show'); }
function closeCartFn(){ document.getElementById('cartDrawer').classList.remove('show'); document.getElementById('cartOverlay').classList.remove('show'); }

/* ============ QUICK VIEW ============ */
function openQuickView(id){
  const b = findItem(id);
  if(!b) return;
  const modal = document.getElementById('qvModal');
  modal.innerHTML = `
    <button class="modal-close" onclick="closeQV()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    <div class="qv-visual"><div class="qv-book" style="background:${b.img ? `url('${b.img}') center/cover no-repeat` : b.grad}">${b.img ? '' : `<div class="t">${b.title}</div>`}</div></div>
    <div class="qv-info">
      <span class="p-meta"><span>${b.cls}</span> <span>${b.subj}</span></span>
      <h3>${b.title}</h3>
      <div class="p-author">by ${b.author} · Published by ${b.pub}</div>
      <div class="p-rating"><span class="stars">${starString(b.rating)}</span><span class="rv">${b.rating} (${b.rv} reviews)</span></div>
      <div class="qv-detail-list">
        <div>ISBN <b>978-969-${b.id}23-01-${b.id}</b></div>
        <div>Edition <b>2026, Revised</b></div>
        <div>Format <b>${b.fmt || 'Print'}</b></div>
        <div>Pages <b>${b.pages || (180+b.id*8)}</b></div>
      </div>
      <div class="p-price-row"><div class="p-price"><span class="now">${money(b.price)}</span>${b.old?'<span class="old">'+money(b.old)+'</span>':''}</div></div>
      <div class="p-actions">
        <button class="btn-cart" onclick="addToCart('${b.id}'); closeQV();"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg> Add to Cart</button>
        <button class="btn-buy" onclick="addToCart('${b.id}'); closeQV(); openCart();">Buy Now</button>
      </div>
    </div>
  `;
  document.getElementById('qvOverlay').classList.add('show');
}
function closeQV(){ document.getElementById('qvOverlay').classList.remove('show'); }

/* ============ TOAST ============ */
let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ============ INIT SHARED UI ============ */
document.addEventListener('DOMContentLoaded', function(){
  renderCart();

  const cartBtn = document.getElementById('cartBtn');
  const closeCart = document.getElementById('closeCart');
  const cartOverlay = document.getElementById('cartOverlay');
  if(cartBtn) cartBtn.addEventListener('click', openCart);
  if(closeCart) closeCart.addEventListener('click', closeCartFn);
  if(cartOverlay) cartOverlay.addEventListener('click', closeCartFn);

  const qvOverlay = document.getElementById('qvOverlay');
  if(qvOverlay) qvOverlay.addEventListener('click', e=>{ if(e.target.id==='qvOverlay') closeQV(); });

  const burgerBtn = document.getElementById('burgerBtn');
  if(burgerBtn){
    burgerBtn.addEventListener('click', function(){
      const links = document.querySelector('.nav-links');
      if(links.style.display==='flex'){ links.style.display=''; }
      else { links.style.cssText='display:flex; position:absolute; top:74px; left:16px; right:16px; flex-direction:column; background:#fff; border-radius:16px; padding:14px; box-shadow:var(--shadow-lg);'; }
    });
  }

  window.addEventListener('scroll', function(){
    const nav = document.getElementById('siteNav');
    if(nav) nav.classList.toggle('scrolled', window.scrollY>30);
  });

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {threshold:.12});
  revealEls.forEach(el=>io.observe(el));

  const pl = document.getElementById('preloader');
  if(pl) {
    // Hide as soon as DOM is ready, with a tiny delay for smoothness
    setTimeout(()=>pl.classList.add('hide'), 50);
  }
  window.addEventListener('load', ()=>{
    if(pl) pl.classList.add('hide');
  });
});
window.init3DCarousel = function(dataArray) {
  const scene = document.querySelector('.scene-3d');
  if(!scene) return;
  
  let items = [...dataArray].sort(()=>0.5-Math.random()).slice(0, 5);
  let spinnerHTML = '<div class="carousel-3d-spinner" id="carouselSpinner">';
  const angle = 360 / items.length;
  const radius = 170;
  
  items.forEach((item, i) => {
    let linkUrl = item.id ? `product.html?id=${item.id}` : (item.title.toLowerCase().includes('toy') ? 'toys.html' : 'stationery.html');
    spinnerHTML += `
      <div class="carousel-item-3d" style="transform: rotateY(${i * angle}deg) translateZ(${radius}px); cursor: pointer;" onclick="window.location.href='${linkUrl}'">
        <div class="p-cover" style="background:${item.grad || 'var(--navy)'}">${item.img ? `<img src="${item.img}">` : item.title}</div>
        <h4>${item.title}</h4>
      </div>
    `;
  });
  spinnerHTML += '</div>';
  scene.innerHTML = spinnerHTML;
  
  let currAngle = 0;
  const spinner = document.getElementById('carouselSpinner');
  setInterval(() => {
    currAngle -= angle;
    spinner.style.transform = `rotateY(${currAngle}deg)`;
  }, 2500);
}
