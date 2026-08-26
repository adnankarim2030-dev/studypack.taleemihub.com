// ============================================================
// STUDY PACK DYNAMIC FILTERS & CATALOG ENGINE (STABLE & FAST)
// ============================================================

window.currentPage = 1;
window.ITEMS_PER_PAGE = 12;
window.currentBooks = [];

function getCatalogData(type) {
    if (type === 'books') {
        if (typeof BOOKS !== 'undefined' && BOOKS.length > 0) return BOOKS;
        if (typeof SCRAPED_BOOKS !== 'undefined' && SCRAPED_BOOKS.length > 0) return SCRAPED_BOOKS;
        return [];
    } else if (type === 'stationery') {
        if (typeof STATIONERY !== 'undefined' && STATIONERY.length > 0) return STATIONERY;
        if (typeof SCRAPED_STATIONERY !== 'undefined' && SCRAPED_STATIONERY.length > 0) return SCRAPED_STATIONERY;
        if (typeof BOOKS !== 'undefined') return BOOKS.filter(b => (b.category||'').toLowerCase().includes('stationery'));
        return [];
    } else if (type === 'toys') {
        if (typeof TOYS !== 'undefined' && TOYS.length > 0) return TOYS;
        if (typeof SCRAPED_TOYS !== 'undefined' && SCRAPED_TOYS.length > 0) return SCRAPED_TOYS;
        if (typeof BOOKS !== 'undefined') return BOOKS.filter(b => (b.category||'').toLowerCase().includes('toy'));
        return [];
    }
    return [];
}

function inferBookProperties(book) {
    const title = (book.title || '').toLowerCase();
    const cls = (Array.isArray(book.cls) ? book.cls.join(' ') : (book.cls || '')).toLowerCase();
    const rawPub = (book.pub || '').toLowerCase();
    
    // Normalize Publisher
    let pub = 'Other';
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
    
    // Language
    let lang = 'English';
    if (title.includes('urdu') || cls.includes('urdu')) lang = 'Urdu';
    else if (title.includes('sindhi') || cls.includes('sindhi')) lang = 'Sindhi';
    else if (title.includes('arabic') || cls.includes('arabic') || title.includes('islam') || title.includes('quran')) lang = 'Arabic/Islamic';
    book.language = lang;
    
    // Age / Class Group
    let age = 'General';
    if (title.includes('nursery') || title.includes('play group') || title.includes('montessori')) age = 'Early Years (3-5)';
    else if (title.includes('grade 1') || title.includes('grade 2') || title.includes('grade 3') || title.includes('class 1') || title.includes('class 2') || title.includes('class 3')) age = 'Primary (6-8)';
    else if (title.includes('grade 4') || title.includes('grade 5') || title.includes('class 4') || title.includes('class 5')) age = 'Upper Primary (9-11)';
    else if (title.match(/grade [6-8]/) || title.match(/class [6-8]/)) age = 'Middle (12-14)';
    else if (title.match(/grade [9]|10/) || title.match(/class [9]|10/)) age = 'Secondary (15-16)';
    book.age_group = age;
    
    // Genre
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
    let type = 'Writing & School Supplies';
    if (title.includes('pen') || title.includes('pencil') || title.includes('marker') || title.includes('highlighter')) type = 'Writing';
    else if (title.includes('notebook') || title.includes('paper') || title.includes('register') || title.includes('diary')) type = 'Paper & Notebooks';
    else if (title.includes('color') || title.includes('paint') || title.includes('brush') || title.includes('art')) type = 'Art & Craft';
    else if (title.includes('file') || title.includes('folder') || title.includes('stapler') || title.includes('punch')) type = 'Office Supplies';
    else if (title.includes('bag') || title.includes('pouch') || title.includes('geometry')) type = 'Bags & Geometry Sets';
    item.item_type = type;
}

function inferToysProperties(item) {
    const title = (item.title || '').toLowerCase();
    let type = 'Toys & Learning Games';
    if (title.includes('car') || title.includes('vehicle') || title.includes('rc') || title.includes('track')) type = 'Vehicles & Remote Cars';
    else if (title.includes('doll') || title.includes('figure') || title.includes('barbie')) type = 'Dolls & Figures';
    else if (title.includes('board') || title.includes('puzzle') || title.includes('game') || title.includes('educational')) type = 'Educational & Puzzles';
    else if (title.includes('outdoor') || title.includes('ride') || title.includes('sports') || title.includes('ball')) type = 'Outdoor & Sports';
    else if (title.includes('gift') || title.includes('hamper')) type = 'Gifts & Sets';
    item.item_type = type;
}

function extractUniqueOptions(products, prop) {
    const vals = new Set();
    products.forEach(p => {
        if (p[prop]) vals.add(p[prop]);
    });
    return Array.from(vals).filter(Boolean).sort();
}

function renderFilterGroup(title, options, inputClass) {
    if (!options || options.length === 0) return '';
    let html = `<div class="accordion-item active" style="margin-bottom:12px;">
        <div class="acc-head" style="font-weight:700; color:#0B132B; padding:8px 0; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
            ${title} 
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        <div class="acc-body" style="display:flex; flex-direction:column; gap:6px; margin-top:4px;">`;
    options.forEach(opt => {
        html += `<label class="glass-check" style="display:flex; align-items:center; gap:8px; font-size:13px; color:#334155; cursor:pointer;">
            <input type="checkbox" class="${inputClass}" value="${opt}" style="cursor:pointer;">
            <span>${opt}</span>
        </label>`;
    });
    html += `</div></div>`;
    return html;
}

function getPriceRangeHtml() {
    return `<div style="background:#fff; padding:14px; border-radius:10px; margin-bottom:14px; border:1px solid #E2E8F0;">
        <div style="font-weight:700; font-size:13.5px; color:#0B132B; margin-bottom:8px;">Max Price</div>
        <input type="range" id="priceRange" min="100" max="10000" step="100" value="10000" style="width:100%; cursor:pointer;">
        <div style="display:flex; justify-content:space-between; font-size:11.5px; color:#64748B; margin-top:4px;">
            <span>Rs 100</span><span id="priceVal" style="font-weight:700; color:#1565C0;">Rs 10,000</span>
        </div>
    </div>`;
}

function getAvailabilityHtml() {
    return `<div style="background:#fff; padding:12px 14px; border-radius:10px; margin-bottom:14px; border:1px solid #E2E8F0;">
        <label class="glass-check" style="display:flex; align-items:center; gap:8px; margin:0; font-size:13px; font-weight:600; color:#0B132B; cursor:pointer;">
            <input type="checkbox" id="inStockOnly" style="cursor:pointer;"> In Stock Only
        </label>
    </div>`;
}

function injectSidebarHTML(html) {
    const sidebar = document.getElementById('filterCard');
    if (!sidebar) return;
    
    const header = `
        <div class="fc-head" style="padding:16px 16px 8px 16px; display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-size:18px; font-weight:800; color:#0B132B;">Filters</h4>
          <button class="icon-btn" id="closeFilterMobile" style="display:none; background:none; border:none; cursor:pointer;"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
        </div>
        <div style="padding:0 16px 16px 16px;">
    `;
    const footer = `
          <button id="clearFilters" style="width:100%; margin-top:10px; background:#EEF2F6; color:#1E293B; border:none; border-radius:8px; padding:9px; font-weight:700; font-size:12.5px; cursor:pointer;">Clear All Filters</button>
        </div>
    `;
    
    sidebar.innerHTML = header + html + footer;
    
    // Accordion toggle
    sidebar.querySelectorAll(".acc-head").forEach(head => {
        head.addEventListener("click", function() {
            this.parentElement.classList.toggle("active");
        });
    });

    // Checkboxes change
    sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => { if (typeof window.applyFilters === 'function') window.applyFilters(); });
    });
    
    // Price range
    const priceRange = document.getElementById('priceRange');
    const priceVal = document.getElementById('priceVal');
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            if (priceVal) priceVal.innerText = 'Rs ' + parseInt(e.target.value).toLocaleString();
        });
        priceRange.addEventListener('change', () => { if (typeof window.applyFilters === 'function') window.applyFilters(); });
    }
    
    // Clear filters
    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            if (priceRange) {
                priceRange.value = 10000;
                if (priceVal) priceVal.innerText = 'Rs 10,000';
            }
            if (typeof window.applyFilters === 'function') window.applyFilters();
        });
    }
}

window.renderProducts = function(list) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    const start = ((window.currentPage || 1) - 1) * window.ITEMS_PER_PAGE;
    const pageItems = list.slice(start, start + window.ITEMS_PER_PAGE);
    
    const resultCount = document.getElementById('resultCount');
    if (resultCount) resultCount.textContent = list.length;
    
    const heroCount = document.getElementById('heroBookCount');
    if (heroCount) heroCount.textContent = list.length;

    if (list.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: #64748B;">
            <h3>Koi item nahi mila</h3>
            <p>Filter clear karein ya koi doosra subject search karein.</p>
        </div>`;
        return;
    }

    grid.innerHTML = pageItems.map(b => {
        const id = b.id || '';
        const title = b.title || b.name || 'Study Pack Item';
        const author = b.author || b.brand || b.publisher || 'Study Pack';
        const price = Number(b.price || 0);
        const img = b.img || 'assets/images/logo.png';
        const cls = b.cls || 'All Grades';
        const subj = b.subj || 'General';
        const pub = b.pub || '';
        const rating = b.rating || 5;
        const rv = b.rv || 0;
        const stock = b.stock !== false;
        const oldPrice = b.old || '';

        const moneyStr = typeof window.money === 'function' ? window.money(price) : 'PKR ' + price.toLocaleString();
        const oldStr = oldPrice ? (typeof window.money === 'function' ? window.money(oldPrice) : 'PKR ' + Number(oldPrice).toLocaleString()) : '';
        const starsStr = typeof window.starString === 'function' ? window.starString(rating) : '★★★★★';

        return `
        <div class="p-card" data-id="${id}" style="background:#fff; border-radius:12px; border:1px solid #E2E8F0; padding:12px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <div class="p-cover-wrap" style="height:180px; display:flex; align-items:center; justify-content:center; background:#F8FAFC; border-radius:8px; margin-bottom:10px; overflow:hidden;">
            <img src="${img}" alt="${escapeHtml(title)}" onerror="this.src='assets/images/logo.png'" style="max-height:100%; max-width:100%; object-fit:contain;">
          </div>
          <div style="flex:1; display:flex; flex-direction:column;">
            <div style="font-size:11px; font-weight:700; color:#1565C0; text-transform:uppercase; margin-bottom:3px;">${cls} • ${subj}</div>
            <div style="font-size:13.5px; font-weight:700; color:#0F172A; line-height:1.3; margin-bottom:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;" title="${escapeHtml(title)}">${escapeHtml(title)}</div>
            <div style="font-size:11.5px; color:#64748B; margin-bottom:8px;">${pub ? escapeHtml(pub) : escapeHtml(author)}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; margin-bottom:10px;">
              <div>
                <span style="font-size:15px; font-weight:800; color:#0F172A;">${moneyStr}</span>
                ${oldStr ? `<span style="font-size:11px; color:#94A3B8; text-decoration:line-through; margin-left:4px;">${oldStr}</span>` : ''}
              </div>
              <span style="font-size:11px; font-weight:700; color:#10B981;">In Stock</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button onclick="addToCart('${id}')" style="flex:1; padding:8px; background:#0F172A; color:#fff; border:none; border-radius:6px; font-weight:700; font-size:12px; cursor:pointer;">Add to Cart</button>
              <button onclick="addToCart('${id}'); openCart();" style="flex:1; padding:8px; background:#1565C0; color:#fff; border:none; border-radius:6px; font-weight:700; font-size:12px; cursor:pointer;">Buy Now</button>
            </div>
          </div>
        </div>`;
    }).join('');

    renderPagination(list.length);
};

function renderPagination(total) {
    const pages = Math.max(1, Math.ceil(total / window.ITEMS_PER_PAGE));
    const el = document.getElementById('pagination');
    if (!el) return;
    
    const currentPage = window.currentPage || 1;
    let html = `<button class="nav-arrow" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} style="padding:6px 12px; border-radius:6px; border:1px solid #CBD5E1; cursor:pointer;">&lt;</button>`;
    
    for(let i = 1; i <= pages; i++){
        if(i === 1 || i === pages || (i >= currentPage - 1 && i <= currentPage + 1)){
            html += `<button class="pg-num ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})" style="padding:6px 12px; margin:0 3px; border-radius:6px; border:1px solid #CBD5E1; font-weight:700; ${i === currentPage ? 'background:#1565C0; color:#fff;' : 'background:#fff;'} cursor:pointer;">${i}</button>`;
        } else if(i === currentPage - 2 || i === currentPage + 2){
            html += `<span class="dots" style="margin:0 4px;">...</span>`;
        }
    }
    
    html += `<button class="nav-arrow" onclick="goPage(${currentPage + 1})" ${currentPage === pages ? 'disabled' : ''} style="padding:6px 12px; border-radius:6px; border:1px solid #CBD5E1; cursor:pointer;">&gt;</button>`;
    el.innerHTML = html;
}

window.goPage = function(p) {
    const total = window.currentBooks ? window.currentBooks.length : 0;
    const pages = Math.max(1, Math.ceil(total / window.ITEMS_PER_PAGE));
    if (p < 1 || p > pages) return;
    
    window.currentPage = p;
    window.renderProducts(window.currentBooks || []);
    const grid = document.getElementById('productGrid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function processAndSort(filtered) {
    const sortSelect = document.getElementById('sortSelect');
    const sort = sortSelect ? sortSelect.value : 'pop';
    
    if (sort === 'low') filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    else if (sort === 'high') filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    else if (sort === 'rating') filtered.sort((a, b) => (Number(b.rating) || 5) - (Number(a.rating) || 5));
    
    window.currentBooks = filtered;
    window.currentPage = 1;
    window.renderProducts(window.currentBooks);
}

function initDynamicFilters() {
    const path = window.location.pathname.toLowerCase();
    const page = path.split('/').pop() || 'index.html';
    
    if (page.includes('toys')) {
        generateToysFilters();
    } else if (page.includes('stationery')) {
        generateStationeryFilters();
    } else {
        generateBooksFilters();
    }
}

function generateBooksFilters() {
    const rawBooks = getCatalogData('books');
    const actualBooks = rawBooks.filter(b => {
        const cat = (b.category || b.cats || '').toLowerCase();
        if (cat.includes('toy') || cat.includes('stationery')) return false;
        return true;
    });
    actualBooks.forEach(inferBookProperties);
    
    const basePubs = extractUniqueOptions(actualBooks, 'pub');
    const requestedPubs = ['AFAQ Publishers', 'Cambridge University Press', 'ERI Publishers', 'Oxford Books', 'Paramount', 'Spectrum Books', 'Sindh Text Book'];
    const pubs = Array.from(new Set([...basePubs, ...requestedPubs])).sort();
    
    const genres = extractUniqueOptions(actualBooks, 'genre');
    const langs = extractUniqueOptions(actualBooks, 'language');
    const ages = extractUniqueOptions(actualBooks, 'age_group');
    
    let html = '';
    html += renderFilterGroup('Publisher', pubs, 'dyn-pub');
    html += renderFilterGroup('Subject / Genre', genres, 'dyn-genre');
    html += renderFilterGroup('Language', langs, 'dyn-lang');
    html += renderFilterGroup('Class / Age Group', ages, 'dyn-age');
    html += getPriceRangeHtml();
    html += getAvailabilityHtml();
    
    injectSidebarHTML(html);
    
    window.applyFilters = function() {
        const checkedPubs = Array.from(document.querySelectorAll('.dyn-pub:checked')).map(cb => cb.value);
        const checkedGenres = Array.from(document.querySelectorAll('.dyn-genre:checked')).map(cb => cb.value);
        const checkedLangs = Array.from(document.querySelectorAll('.dyn-lang:checked')).map(cb => cb.value);
        const checkedAges = Array.from(document.querySelectorAll('.dyn-age:checked')).map(cb => cb.value);
        
        const priceRangeEl = document.getElementById('priceRange');
        const maxPrice = priceRangeEl ? Number(priceRangeEl.value) : 10000;
        const inStockEl = document.getElementById('inStockOnly');
        const inStockOnly = inStockEl ? inStockEl.checked : false;
        
        const urlParams = new URLSearchParams(window.location.search);
        const query = (urlParams.get('q') || '').toLowerCase().trim();
        
        const filtered = actualBooks.filter(b => {
            if (checkedPubs.length > 0 && !checkedPubs.includes(b.pub)) return false;
            if (checkedGenres.length > 0 && !checkedGenres.includes(b.genre)) return false;
            if (checkedLangs.length > 0 && !checkedLangs.includes(b.language)) return false;
            if (checkedAges.length > 0 && !checkedAges.includes(b.age_group)) return false;
            if (Number(b.price || 0) > maxPrice) return false;
            if (inStockOnly && b.stock === false) return false;
            
            if (query) {
                const searchStr = `${b.title||''} ${b.cls||''} ${b.pub||''} ${b.genre||''} ${b.author||''} ${b.subj||''}`.toLowerCase();
                if (!searchStr.includes(query)) return false;
            }
            return true;
        });
        
        processAndSort(filtered);
    };
    
    window.applyFilters();
}

function generateStationeryFilters() {
    const rawStat = getCatalogData('stationery');
    rawStat.forEach(inferStationeryProperties);
    
    const types = extractUniqueOptions(rawStat, 'item_type');
    let html = '';
    html += renderFilterGroup('Product Type', types, 'dyn-type');
    html += getPriceRangeHtml();
    html += getAvailabilityHtml();
    
    injectSidebarHTML(html);
    
    window.applyFilters = function() {
        const checkedTypes = Array.from(document.querySelectorAll('.dyn-type:checked')).map(cb => cb.value);
        const priceRangeEl = document.getElementById('priceRange');
        const maxPrice = priceRangeEl ? Number(priceRangeEl.value) : 10000;
        const inStockEl = document.getElementById('inStockOnly');
        const inStockOnly = inStockEl ? inStockEl.checked : false;
        
        const filtered = rawStat.filter(b => {
            if (checkedTypes.length > 0 && !checkedTypes.includes(b.item_type)) return false;
            if (Number(b.price || 0) > maxPrice) return false;
            if (inStockOnly && b.stock === false) return false;
            return true;
        });
        
        processAndSort(filtered);
    };
    
    window.applyFilters();
}

function generateToysFilters() {
    const rawToys = getCatalogData('toys');
    rawToys.forEach(inferToysProperties);
    
    const types = extractUniqueOptions(rawToys, 'item_type');
    let html = '';
    html += renderFilterGroup('Toy Type', types, 'dyn-type');
    html += getPriceRangeHtml();
    html += getAvailabilityHtml();
    
    injectSidebarHTML(html);
    
    window.applyFilters = function() {
        const checkedTypes = Array.from(document.querySelectorAll('.dyn-type:checked')).map(cb => cb.value);
        const priceRangeEl = document.getElementById('priceRange');
        const maxPrice = priceRangeEl ? Number(priceRangeEl.value) : 10000;
        const inStockEl = document.getElementById('inStockOnly');
        const inStockOnly = inStockEl ? inStockEl.checked : false;
        
        const filtered = rawToys.filter(b => {
            if (checkedTypes.length > 0 && !checkedTypes.includes(b.item_type)) return false;
            if (Number(b.price || 0) > maxPrice) return false;
            if (inStockOnly && b.stock === false) return false;
            return true;
        });
        
        processAndSort(filtered);
    };
    
    window.applyFilters();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Auto init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    initDynamicFilters();
    setTimeout(initDynamicFilters, 250);
});
