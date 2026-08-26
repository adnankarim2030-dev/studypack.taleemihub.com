// dynamic_filters.js

document.addEventListener("DOMContentLoaded", function() {
    window.addEventListener('firebaseProductsLoaded', initDynamicFilters);
    
    // In case products are already loaded before this script runs
    if ((typeof BOOKS !== 'undefined' && BOOKS.length > 0) || (typeof STATIONERY !== 'undefined' && STATIONERY.length > 0) || (typeof TOYS !== 'undefined' && TOYS.length > 0)) {
        initDynamicFilters();
    }
});

function initDynamicFilters() { console.log('initDynamicFilters called');
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (page.includes('books')) {
        generateBooksFilters();
    } else if (page.includes('stationery')) {
        generateStationeryFilters();
    } else if (page.includes('toys')) {
        generateToysFilters();
    }
}

function inferBookProperties(book) {
    const title = (book.title || '').toLowerCase();
    const cls = (Array.isArray(book.cls) ? book.cls.join(' ') : (book.cls || '')).toLowerCase();
    
    // Infer Publisher
    let pub = 'Other';
    const rawPub = (book.pub || '').toLowerCase();
    if (rawPub.includes('oxford') || rawPub.includes('oup') || title.includes('oxford') || cls.includes('oxford')) {
        pub = 'Oxford Books';
    } else if (title.includes('eri ') || cls.includes('eri ') || rawPub.includes('eri')) {
        pub = 'ERI Publishers';
    } else if (title.includes('afaq') || cls.includes('afaq') || rawPub.includes('afaq')) {
        pub = 'AFAQ Publishers';
    } else if (title.includes('paramount') || cls.includes('paramount') || rawPub.includes('paramount')) {
        pub = 'Paramount';
    } else if (title.includes('cambridge') || cls.includes('cambridge') || rawPub.includes('cambridge')) {
        pub = 'Cambridge University Press';
    } else if (title.includes('spectrum') || cls.includes('spectrum') || rawPub.includes('spectrum')) {
        pub = 'Spectrum Books';
    } else if (book.pub) {
        pub = book.pub;
    }
    book.pub = pub;
    
    // Infer Language
    let lang = 'English';
    if (title.includes('urdu') || cls.includes('urdu')) lang = 'Urdu';
    else if (title.includes('sindhi') || cls.includes('sindhi')) lang = 'Sindhi';
    else if (title.includes('arabic') || cls.includes('arabic') || title.includes('islam') || title.includes('quran')) lang = 'Arabic/Islamic';
    book.language = lang;
    
    // Infer Format
    book.format = 'Paperback';
    
    // Infer Age Group
    let age = 'General';
    if (title.includes('nursery') || title.includes('play group') || title.includes('montessori')) age = 'Early Years (3-5)';
    else if (title.includes('grade 1') || title.includes('grade 2') || title.includes('grade 3') || title.includes('class 1') || title.includes('class 2') || title.includes('class 3')) age = 'Primary (6-8)';
    else if (title.includes('grade 4') || title.includes('grade 5') || title.includes('class 4') || title.includes('class 5')) age = 'Upper Primary (9-11)';
    else if (title.match(/grade [6-8]/) || title.match(/class [6-8]/)) age = 'Middle (12-14)';
    else if (title.match(/grade [9]|10/) || title.match(/class [9]|10/)) age = 'Secondary (15-16)';
    book.age_group = age;
    
    // Subcategory/Genre
    let genre = 'General';
    if (title.includes('science')) genre = 'Science';
    else if (title.includes('math')) genre = 'Mathematics';
    else if (title.includes('english')) genre = 'English';
    else if (title.includes('urdu')) genre = 'Urdu';
    else if (title.includes('islam')) genre = 'Islamic Studies';
    else if (title.includes('computer')) genre = 'Computer';
    else if (title.includes('history') || title.includes('social')) genre = 'Social Studies';
    else if (book.subj) genre = Array.isArray(book.subj) ? book.subj[0] : book.subj;
    book.genre = genre;
}

function inferStationeryProperties(item) {
    const title = (item.title || '').toLowerCase();
    let type = 'General';
    if (title.includes('pen ') || title.includes('pencil') || title.includes('marker') || title.includes('highlighter')) type = 'Writing';
    else if (title.includes('notebook') || title.includes('paper') || title.includes('register') || title.includes('diary')) type = 'Paper';
    else if (title.includes('color') || title.includes('paint') || title.includes('brush') || title.includes('art')) type = 'Art & Craft';
    else if (title.includes('file') || title.includes('folder') || title.includes('stapler') || title.includes('punch')) type = 'Office Supplies';
    else if (title.includes('bag') || title.includes('pouch') || title.includes('geometry')) type = 'Bags & Accessories';
    item.item_type = type;
}

function inferToysProperties(item) {
    const title = (item.title || '').toLowerCase();
    let type = 'General';
    if (title.includes('car') || title.includes('vehicle') || title.includes('rc') || title.includes('track')) type = 'Vehicles & RC Toys';
    else if (title.includes('doll') || title.includes('figure') || title.includes('barbie')) type = 'Dolls & Figures';
    else if (title.includes('board') || title.includes('puzzle') || title.includes('game') || title.includes('educational')) type = 'Educational & Games';
    else if (title.includes('outdoor') || title.includes('ride') || title.includes('sports') || title.includes('ball')) type = 'Outdoor Toys';
    else if (title.includes('gift') || title.includes('hamper')) type = 'Gifts & Hampers';
    item.item_type = type;
    
    let age = 'All Ages';
    if (title.includes('baby') || title.includes('toddler')) age = '0-3 Years';
    else if (title.includes('kids')) age = '4-8 Years';
    item.age_group = age;
}

function extractUniqueOptions(products, prop) {
    const vals = new Set();
    products.forEach(p => {
        if (p[prop]) vals.add(p[prop]);
    });
    return Array.from(vals).sort();
}

function renderFilterGroup(title, options, inputClass) {
    if (options.length === 0) return '';
    let html = `<div class="accordion-item active">
        <div class="acc-head">${title} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="acc-arrow"><path d="m6 9 6 6 6-6"/></svg></div>
        <div class="acc-body">`;
    options.forEach(opt => {
        html += `<label class="glass-check"><input type="checkbox" class="${inputClass}" value="${opt}"> <span class="chk-box"></span> ${opt}</label>`;
    });
    html += `</div></div>`;
    return html;
}

function getPriceRangeHtml() {
    return `<div style="background: #fff; padding: 16px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">
        <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: var(--navy);">Max Price</h4>
        <input type="range" id="priceRange" min="100" max="10000" step="100" value="10000" style="width: 100%;">
        <div style="display:flex; justify-content:space-between; font-size: 12px; color: #475569; margin-top:8px;">
            <span>Rs 100</span><span id="priceVal">Rs 10,000</span>
        </div>
    </div>`;
}

function getAvailabilityHtml() {
    return `<div style="background: #fff; padding: 16px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">
        <label class="glass-check" style="margin:0;"><input type="checkbox" id="inStockOnly"> <span class="chk-box"></span> In Stock Only</label>
    </div>`;
}

function setupAccordions() {
    const accHeads = document.querySelectorAll(".acc-head");
    accHeads.forEach(head => {
      // Avoid attaching multiple times
      const clonedHead = head.cloneNode(true);
      head.parentNode.replaceChild(clonedHead, head);
      
      clonedHead.addEventListener("click", function() {
        const parent = this.parentElement;
        parent.classList.toggle("active");
      });
    });
}

function injectSidebarHTML(html, applyFunc) {
    const sidebar = document.getElementById('filterCard');
    if (!sidebar) return;
    
    const header = `
        <div class="fc-head" style="padding: 24px 24px 10px 24px;">
          <h4 style="margin: 0; font-size: 22px; font-weight: 700; color: var(--navy);">Filters</h4>
          <button class="icon-btn" id="closeFilterMobile" style="display: none;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
        </div>
        <div style="padding: 0 24px;">
    `;
    const footer = `
          <button id="clearFilters" style="width: 100%; margin-bottom: 24px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; padding: 10px; font-weight: 600; cursor: pointer; transition: 0.3s;">Clear All Filters</button>
        </div>
    `;
    
    sidebar.innerHTML = header + html + footer;
    setupAccordions();
    
    // Attach event listeners
    const checkboxes = sidebar.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.addEventListener('change', () => { if(typeof window.applyFilters === 'function') window.applyFilters(); }));
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => { if(typeof window.applyFilters === 'function') window.applyFilters(); });
    }
    
    const priceRange = document.getElementById('priceRange');
    const priceVal = document.getElementById('priceVal');
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            priceVal.innerText = 'Rs ' + parseInt(e.target.value).toLocaleString();
        });
        priceRange.addEventListener('change', () => { if(typeof window.applyFilters === 'function') window.applyFilters(); });
    }
    
    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            checkboxes.forEach(cb => cb.checked = false);
            if (priceRange) {
                priceRange.value = 10000;
                priceVal.innerText = 'Rs 10,000';
            }
            if(typeof window.applyFilters === 'function') window.applyFilters();
        });
    }
    
    const closeBtn = document.getElementById('closeFilterMobile');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('show');
        });
    }
}


const ITEMS_ITEMS_PER_PAGE = 9;

window.ITEMS_PER_PAGE = 9;
window.renderProducts = function(list) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    const start = (window.currentPage - 1) * window.ITEMS_PER_PAGE;
    const pageItems = list.slice(start, start + window.ITEMS_PER_PAGE);
    
    const resultCount = document.getElementById('resultCount');
    if (resultCount) resultCount.textContent = list.length;
    
    grid.innerHTML = pageItems.map(b => {
        const id = b.id || '';
        const title = b.title || b.name || '';
        const author = b.author || b.brand || b.publisher || 'Study Pack';
        const price = b.price || 0;
        const img = b.img || '';
        const cls = b.cls || 'Misc';
        const subj = b.subj || 'General';
        const pub = b.pub || '';
        const rating = b.rating || 5;
        const rv = b.rv || 0;
        const stock = b.stock !== false;
        const oldPrice = b.old || '';
        const tag = b.tag || '';

        let badgeHtml = '';
        if (tag === 'best') badgeHtml += '<span class="pill best">Bestseller</span>';
        if (tag === 'new') badgeHtml += '<span class="pill new">New</span>';
        if (oldPrice) badgeHtml += '<span class="pill off">-'+Math.round(100-(price/oldPrice*100))+'%</span>';

        let moneyStr = typeof window.money === 'function' ? window.money(price) : 'Rs ' + price;
        let oldStr = oldPrice ? (typeof window.money === 'function' ? window.money(oldPrice) : 'Rs ' + oldPrice) : '';
        let starsStr = typeof window.starString === 'function' ? window.starString(rating) : '★★★★★';

        return `
<div class="p-card" style="min-width:0; overflow:hidden;" data-id="${id}">
      <div class="p-cover-wrap">
        <div class="p-cover" style="background:${img ? '#fff' : (b.grad || 'var(--grey)')}; padding: ${img ? '0' : '10px'}">
          <div class="badges-row">
            ${badgeHtml}
          </div>
          <div class="quick-actions">
            <button class="qa-btn" title="Wishlist" onclick="showToast('Added to wishlist')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
            <button class="qa-btn" title="Quick View" onclick="openQuickView(${id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
            <button class="qa-btn" title="Compare" onclick="showToast('Added to compare')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v18M16 3v18M3 8h5M16 8h5M3 16h5M16 16h5"/></svg></button>
          </div>
          ${img ? `<img src="${img}" alt="${title}" onerror="this.style.display='none'" style="width:100%; height:100%; object-fit:contain; border-radius:inherit; mix-blend-mode:multiply;">` : `<div class="p-title" style="text-align:center;">${title}</div>`}
        </div>
      </div>
      <div class="p-meta" style="min-width:0;"><span>${cls}</span><span>${subj}</span></div>
      <div class="p-name">${title}</div>
      <div class="p-author">by ${author} ${pub ? '• ' + pub : ''}</div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:4px;">
        <div class="p-rating" style="margin-bottom:0;"><span class="stars">${starsStr}</span><span class="rv">(${rv})</span></div>
        <div class="p-stock" style="margin-bottom:0;"><span class="d" style="background:${stock ? '#2e7d32' : '#c62828'}"></span>${stock ? 'In Stock' : 'Out of Stock'}</div>
      </div>
      <div class="p-price-row">
        <div class="p-price"><span class="now">${moneyStr}</span>${oldStr ? '<span class="old">' + oldStr + '</span>' : ''}</div>
      </div>
      <div class="p-actions" style="display:flex; flex-direction:column; gap:8px;">
        <button class="btn-cart" onclick="addToCart('${id}')" style="width:100%; justify-content:center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg> Add to Cart</button>
        <button class="btn-buy" onclick="addToCart('${id}'); openCart();" style="width:100%; justify-content:center;">Buy Now</button>
      </div>
    </div>
        `;
    }).join('');
    if (typeof window.renderPagination === 'function') {
        window.renderPagination(list.length);
    }
};

window.renderPagination = function(total) {
    const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    const el = document.getElementById('pagination');
    if (!el) return;
    
    const currentPage = window.currentPage || 1;
    let html = `<button class="nav-arrow" onclick="window.goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>`;
    
    for(let i=1; i<=pages; i++){
        if(i===1 || i===pages || (i>=currentPage-1 && i<=currentPage+1)){
            html += `<button class="pg-num ${i===currentPage?'active':''}" onclick="window.goPage(${i})">${i}</button>`;
        } else if(i===currentPage-2 || i===currentPage+2){
            html += `<span class="dots">...</span>`;
        }
    }
    
    html += `<button class="nav-arrow" onclick="window.goPage(${currentPage + 1})" ${currentPage === pages ? 'disabled' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>`;
    el.innerHTML = html;
};

window.goPage = function(p) {
    const total = window.currentBooks ? window.currentBooks.length : 0;
    const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    if (p < 1 || p > pages) return;
    
    window.currentPage = p;
    window.renderProducts(window.currentBooks || []);
    window.scrollTo({ top: document.getElementById('productGrid').offsetTop - 100, behavior: 'smooth' });
};

function processAndSort(filtered) { console.log('processAndSort called with filtered length:', filtered.length);
    const sort = document.getElementById('sortSelect') ? document.getElementById('sortSelect').value : 'new';
    if(sort==='low') filtered.sort((a,b)=>a.price-b.price);
    else if(sort==='high') filtered.sort((a,b)=>b.price-a.price);
    else if(sort==='rating') filtered.sort((a,b)=>(b.rating||0)-(a.rating||0));
    
    window.currentBooks = filtered; // currentBooks is used globally for pagination
    window.currentPage = 1;
    
    // Update pagination and grid
    window.renderProducts(window.currentBooks);
    
    // Update count
    const countEl = document.getElementById('resultCount');
    if (countEl) countEl.textContent = filtered.length;
}

function generateBooksFilters() {
    let books = [];
    if (typeof BOOKS !== 'undefined') books = BOOKS;
    
    // Filter down to actual books
    const actualBooks = books.filter(b => {
        const cat = (b.category || b.cats || '').toLowerCase();
        const cls = (Array.isArray(b.cls) ? b.cls.join(' ') : (b.cls || '')).toLowerCase();
        const type = (b.type || '').toLowerCase();
        
        if (cat.includes('toy') || cls.includes('toy') || cat.includes('gift')) return false;
        if (cat.includes('stationery') || cls.includes('stationery')) return false;
        
        return b.category === 'School Books' || b.type === 'Book' || cat.includes('book') || cls.includes('book') || cls.includes('class') || cls.includes('grade') || (!b.category && !b.type);
    });
    actualBooks.forEach(inferBookProperties);
    
    let basePubs = extractUniqueOptions(actualBooks, 'pub');
    // Ensure the requested publishers are always present in the books filter
    const requestedPubs = ['ERI Publishers', 'AFAQ Publishers', 'Paramount', 'Cambridge University Press', 'Oxford Books'];
    const pubs = Array.from(new Set([...basePubs, ...requestedPubs])).sort();
    
    const genres = extractUniqueOptions(actualBooks, 'genre');
    const langs = extractUniqueOptions(actualBooks, 'language');
    const ages = extractUniqueOptions(actualBooks, 'age_group');
    
    let html = '';
    html += renderFilterGroup('Publisher', pubs, 'dyn-pub');
    html += renderFilterGroup('Genre', genres, 'dyn-genre');
    html += renderFilterGroup('Language', langs, 'dyn-lang');
    html += renderFilterGroup('Age Group', ages, 'dyn-age');
    html += getPriceRangeHtml();
    html += getAvailabilityHtml();
    
    injectSidebarHTML(html);
    
    // Override globally
    window.applyFilters = function() {
        const checkedPubs = Array.from(document.querySelectorAll('.dyn-pub:checked')).map(cb => cb.value);
        const checkedGenres = Array.from(document.querySelectorAll('.dyn-genre:checked')).map(cb => cb.value);
        const checkedLangs = Array.from(document.querySelectorAll('.dyn-lang:checked')).map(cb => cb.value);
        const checkedAges = Array.from(document.querySelectorAll('.dyn-age:checked')).map(cb => cb.value);
        const priceRangeEl = document.getElementById('priceRange');
        let maxPrice = 10000;
        if (priceRangeEl && priceRangeEl.value) {
            const parsed = parseInt(priceRangeEl.value);
            if (!isNaN(parsed)) maxPrice = parsed;
        }
        const inStockEl = document.getElementById('inStockOnly');
        const inStockOnly = inStockEl ? inStockEl.checked : false;
        
        // Search query check
        const urlParams = new URLSearchParams(window.location.search);
        let initialQuery = (urlParams.get('q') || '').toLowerCase().trim();
        
        const filtered = actualBooks.filter(b => {
            if (checkedPubs.length > 0 && !checkedPubs.includes(b.pub)) return false;
            if (checkedGenres.length > 0 && !checkedGenres.includes(b.genre)) return false;
            if (checkedLangs.length > 0 && !checkedLangs.includes(b.language)) return false;
            if (checkedAges.length > 0 && !checkedAges.includes(b.age_group)) return false;
            
            // Handle price
            let itemPrice = b.price;
            if (typeof itemPrice === 'string') {
                itemPrice = parseFloat(itemPrice.replace(/[^0-9.]/g, ''));
            }
            if (!isNaN(itemPrice) && itemPrice > maxPrice) return false;
            
            // Handle stock
            if (inStockOnly && (b.stock === false || b.stock === 'false')) return false;
            
            if (initialQuery !== '') {
                const subjStr = Array.isArray(b.subj) ? b.subj.join(' ') : (b.subj||'');
                const searchStr = ((b.title||'') + ' ' + (b.cls||'') + ' ' + (b.pub||'') + ' ' + (b.genre||'') + ' ' + (b.author||'') + ' ' + subjStr).toLowerCase();
                if (!searchStr.includes(initialQuery)) return false;
            }
            
            return true;
        });
        
        processAndSort(filtered);
    };
    
    // Initial call
    window.applyFilters();
}

function generateStationeryFilters() { console.log('generateStationeryFilters called');
    let stat = [];
    if (typeof STATIONERY !== 'undefined' && STATIONERY.length > 0) stat = STATIONERY;
    else if (typeof BOOKS !== 'undefined') stat = BOOKS.filter(b => (b.category || '').toLowerCase().includes('stationery') || (b.cls || '').toLowerCase().includes('stationery'));
    
    stat.forEach(inferStationeryProperties);
    
    const types = extractUniqueOptions(stat, 'item_type');
    
    let html = '';
    html += renderFilterGroup('Product Type', types, 'dyn-type');
    html += getPriceRangeHtml();
    html += getAvailabilityHtml();
    
    injectSidebarHTML(html);
    
    window.applyFilters = function() {
        const checkedTypes = Array.from(document.querySelectorAll('.dyn-type:checked')).map(cb => cb.value);
        const priceRangeEl = document.getElementById('priceRange');
        const maxPrice = priceRangeEl ? parseInt(priceRangeEl.value) : 10000;
        const inStockEl = document.getElementById('inStockOnly');
        const inStockOnly = inStockEl ? inStockEl.checked : false;
        
        const filtered = stat.filter(b => {
            if (checkedTypes.length > 0 && !checkedTypes.includes(b.item_type)) return false;
            if (b.price > maxPrice) return false;
            if (inStockOnly && b.stock === false) return false;
            return true;
        });
        
        processAndSort(filtered);
    };
    
    window.applyFilters();
}

function generateToysFilters() {
    let toys = [];
    if (typeof TOYS !== 'undefined' && TOYS.length > 0) toys = TOYS;
    else if (typeof BOOKS !== 'undefined') toys = BOOKS.filter(b => (b.category || '').toLowerCase().includes('toy') || (b.cls || '').toLowerCase().includes('toy') || (b.category || '').toLowerCase().includes('gift'));
    
    toys.forEach(inferToysProperties);
    
    const types = extractUniqueOptions(toys, 'item_type');
    const ages = extractUniqueOptions(toys, 'age_group');
    
    let html = '';
    html += renderFilterGroup('Toy Type', types, 'dyn-type');
    html += renderFilterGroup('Age Group', ages, 'dyn-age');
    html += getPriceRangeHtml();
    html += getAvailabilityHtml();
    
    injectSidebarHTML(html);
    
    window.applyFilters = function() {
        const checkedTypes = Array.from(document.querySelectorAll('.dyn-type:checked')).map(cb => cb.value);
        const checkedAges = Array.from(document.querySelectorAll('.dyn-age:checked')).map(cb => cb.value);
        const priceRangeEl = document.getElementById('priceRange');
        const maxPrice = priceRangeEl ? parseInt(priceRangeEl.value) : 10000;
        const inStockEl = document.getElementById('inStockOnly');
        const inStockOnly = inStockEl ? inStockEl.checked : false;
        
        const filtered = toys.filter(b => {
            if (checkedTypes.length > 0 && !checkedTypes.includes(b.item_type)) return false;
            if (checkedAges.length > 0 && !checkedAges.includes(b.age_group)) return false;
            if (b.price > maxPrice) return false;
            if (inStockOnly && b.stock === false) return false;
            return true;
        });
        
        processAndSort(filtered);
    };
    
    window.applyFilters();
}



window.ITEMS_PER_PAGE = 9;
window.renderProducts = function(list) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    const start = (window.currentPage - 1) * window.ITEMS_PER_PAGE;
    const pageItems = list.slice(start, start + window.ITEMS_PER_PAGE);
    
    const resultCount = document.getElementById('resultCount');
    if (resultCount) resultCount.textContent = list.length;
    
    grid.innerHTML = pageItems.map(b => {
        const id = b.id || '';
        const title = b.title || b.name || '';
        const author = b.author || b.brand || b.publisher || 'Study Pack';
        const price = b.price || 0;
        const img = b.img || '';
        const cls = b.cls || 'Misc';
        const subj = b.subj || 'General';
        const pub = b.pub || '';
        const rating = b.rating || 5;
        const rv = b.rv || 0;
        const stock = b.stock !== false;
        const oldPrice = b.old || '';
        const tag = b.tag || '';

        let badgeHtml = '';
        if (tag === 'best') badgeHtml += '<span class="pill best">Bestseller</span>';
        if (tag === 'new') badgeHtml += '<span class="pill new">New</span>';
        if (oldPrice) badgeHtml += '<span class="pill off">-'+Math.round(100-(price/oldPrice*100))+'%</span>';

        let moneyStr = typeof window.money === 'function' ? window.money(price) : 'Rs ' + price;
        let oldStr = oldPrice ? (typeof window.money === 'function' ? window.money(oldPrice) : 'Rs ' + oldPrice) : '';
        let starsStr = typeof window.starString === 'function' ? window.starString(rating) : '★★★★★';

        return `
<div class="p-card" style="min-width:0; overflow:hidden;" data-id="${id}">
      <div class="p-cover-wrap">
        <div class="p-cover" style="background:${img ? '#fff' : (b.grad || 'var(--grey)')}; padding: ${img ? '0' : '10px'}">
          <div class="badges-row">
            ${badgeHtml}
          </div>
          <div class="quick-actions">
            <button class="qa-btn" title="Wishlist" onclick="showToast('Added to wishlist')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
            <button class="qa-btn" title="Quick View" onclick="openQuickView(${id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
            <button class="qa-btn" title="Compare" onclick="showToast('Added to compare')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v18M16 3v18M3 8h5M16 8h5M3 16h5M16 16h5"/></svg></button>
          </div>
          ${img ? `<img src="${img}" alt="${title}" onerror="this.style.display='none'" style="width:100%; height:100%; object-fit:contain; border-radius:inherit; mix-blend-mode:multiply;">` : `<div class="p-title" style="text-align:center;">${title}</div>`}
        </div>
      </div>
      <div class="p-meta" style="min-width:0;"><span>${cls}</span><span>${subj}</span></div>
      <div class="p-name">${title}</div>
      <div class="p-author">by ${author} ${pub ? '• ' + pub : ''}</div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:4px;">
        <div class="p-rating" style="margin-bottom:0;"><span class="stars">${starsStr}</span><span class="rv">(${rv})</span></div>
        <div class="p-stock" style="margin-bottom:0;"><span class="d" style="background:${stock ? '#2e7d32' : '#c62828'}"></span>${stock ? 'In Stock' : 'Out of Stock'}</div>
      </div>
      <div class="p-price-row">
        <div class="p-price"><span class="now">${moneyStr}</span>${oldStr ? '<span class="old">' + oldStr + '</span>' : ''}</div>
      </div>
      <div class="p-actions" style="display:flex; flex-direction:column; gap:8px;">
        <button class="btn-cart" onclick="addToCart('${id}')" style="width:100%; justify-content:center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg> Add to Cart</button>
        <button class="btn-buy" onclick="addToCart('${id}'); openCart();" style="width:100%; justify-content:center;">Buy Now</button>
      </div>
    </div>
        `;
    }).join('');
    
    if (typeof window.renderPagination === 'function') {
        window.renderPagination(list.length);
    }
};
