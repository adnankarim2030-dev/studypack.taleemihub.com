/* ========================================================
   STUDY PACK SMART AI SEARCH ENGINE & INSTANT DROPDOWN
   ======================================================== */

document.addEventListener("DOMContentLoaded", function() {
  const searchForm = document.querySelector(".nav-search-bar");
  if (!searchForm) return;

  const searchInput = searchForm.querySelector("input");
  
  // Create Dropdown Container
  let dropdown = searchForm.querySelector(".ai-search-dropdown");
  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.className = "ai-search-dropdown";
    searchForm.appendChild(dropdown);
  }

  let searchTimeout;

  // Typo & Synonym Correction Dictionary
  const TYPO_MAP = {
    'englsih': 'english',
    'engls': 'english',
    'eng': 'english',
    'englis': 'english',
    'oxfrd': 'oxford',
    'oxfrod': 'oxford',
    'oxforde': 'oxford',
    'maths': 'math',
    'mathes': 'math',
    'mathmatics': 'mathematics',
    'cntdown': 'countdown',
    'countdon': 'countdown',
    'scince': 'science',
    'scence': 'science',
    'sience': 'science',
    'bio': 'biology',
    'chem': 'chemistry',
    'chemstry': 'chemistry',
    'phy': 'physics',
    'physic': 'physics',
    'urduu': 'urdu',
    'sindhy': 'sindhi',
    'sndhi': 'sindhi',
    'islamiat': 'islamic',
    'islamyat': 'islamic',
    'islamic': 'islamic',
    'cambrige': 'cambridge',
    'cambredge': 'cambridge',
    'paramont': 'paramount',
    'spectrm': 'spectrum',
    'becon': 'beacon',
    'beaconhouse': 'beacon',
    'hapy': 'happy',
    'happyhome': 'happy home',
    'mamaparsi': 'mama parsi',
    'cityschool': 'the city school',
    'educators': 'educators'
  };

  function normalizeSearchTerms(raw) {
    const q = raw.toLowerCase().trim();
    const terms = new Set([q]);

    // Check direct typos
    if (TYPO_MAP[q]) {
      terms.add(TYPO_MAP[q]);
    }

    // Check word-by-word typos
    const words = q.split(/\s+/);
    const correctedWords = words.map(w => TYPO_MAP[w] || w);
    terms.add(correctedWords.join(' '));

    // Common synonyms
    if (q.includes('math') || q.includes('hisab')) {
      terms.add('math');
      terms.add('mathematics');
      terms.add('countdown');
    }
    if (q.includes('eng') || q.includes('english')) {
      terms.add('english');
      terms.add('oxford');
    }
    if (q.includes('urdu')) {
      terms.add('urdu');
      terms.add('narde');
      terms.add('gul-e-lala');
    }
    if (q.includes('sci') || q.includes('science')) {
      terms.add('science');
      terms.add('amazing science');
    }

    return Array.from(terms);
  }

  // Handle Input with Smart Fuzzy Search
  searchInput.addEventListener("input", function(e) {
    clearTimeout(searchTimeout);
    const rawQuery = e.target.value.toLowerCase().trim();
    
    if (rawQuery.length < 2) {
      dropdown.classList.remove("show");
      searchForm.classList.remove("expanded");
      return;
    }

    searchForm.classList.add("expanded");

    searchTimeout = setTimeout(() => {
      // Gather Full Catalog
      let catalog = [];
      if (typeof BOOKS !== 'undefined' && BOOKS.length > 0) catalog = catalog.concat(BOOKS);
      if (typeof SCRAPED_BOOKS !== 'undefined' && SCRAPED_BOOKS.length > 0) catalog = catalog.concat(SCRAPED_BOOKS);
      if (typeof SCRAPED_COURSES !== 'undefined' && Array.isArray(SCRAPED_COURSES)) catalog = catalog.concat(SCRAPED_COURSES);
      if (typeof SCRAPED_STATIONERY !== 'undefined' && Array.isArray(SCRAPED_STATIONERY)) catalog = catalog.concat(SCRAPED_STATIONERY);
      if (typeof SCRAPED_TOYS !== 'undefined' && Array.isArray(SCRAPED_TOYS)) catalog = catalog.concat(SCRAPED_TOYS);

      const searchTerms = normalizeSearchTerms(rawQuery);

      const results = catalog.filter(book => {
        const title = (book.title || book.name || '').toLowerCase();
        const author = (book.author || book.brand || '').toLowerCase();
        const subj = (Array.isArray(book.subj) ? book.subj.join(' ') : (book.subj || '')).toLowerCase();
        const pub = (book.pub || book.school || '').toLowerCase();
        const cls = (Array.isArray(book.cls) ? book.cls.join(' ') : (book.cls || '')).toLowerCase();
        const fullStr = `${title} ${author} ${subj} ${pub} ${cls}`;

        return searchTerms.some(term => fullStr.includes(term));
      });

      renderResults(results, rawQuery);
    }, 150);
  });

  // Close when clicking outside
  document.addEventListener("click", function(e) {
    if (!searchForm.contains(e.target)) {
      dropdown.classList.remove("show");
      searchForm.classList.remove("expanded");
    }
  });

  searchInput.addEventListener("focus", function() {
    if (this.value.trim().length >= 2) {
      this.dispatchEvent(new Event('input'));
    }
  });

  function renderResults(results, query) {
    dropdown.innerHTML = "";
    
    if (results.length === 0) {
      dropdown.innerHTML = `
        <div class="ai-empty-state" style="padding: 24px; text-align: center; color: #475569;">
          <div style="font-size: 24px; margin-bottom: 6px;">🔍</div>
          <div style="font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Koi item nahi mila for "<strong>${escapeHtml(query)}</strong>"</div>
          <div style="font-size: 12.5px; color: #64748B;">Class ya subject (e.g. English, Math, Oxford, Science, Urdu) search karein.</div>
        </div>
      `;
      dropdown.classList.add("show");
      return;
    }

    const header = document.createElement("div");
    header.className = "ai-search-header";
    header.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:10px 16px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-size:12px; font-weight:600; color:#475569;";
    header.innerHTML = `<span>Found ${results.length} results</span><span style="background:#1565C0; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px;">Study Pack Store</span>`;
    dropdown.appendChild(header);

    const list = document.createElement("div");
    list.className = "ai-results-list";
    list.style.cssText = "max-height: 380px; overflow-y: auto;";

    results.slice(0, 8).forEach(book => {
      const item = document.createElement("a");
      item.href = `books.html?q=${encodeURIComponent(book.title || '')}`;
      item.className = "search-result-item";
      item.style.cssText = "display:flex; align-items:center; gap:12px; padding:10px 16px; border-bottom:1px solid #f1f5f9; text-decoration:none; transition:0.2s; background:#fff;";
      
      const img = book.img || 'assets/images/studypack_logo.png';
      const price = typeof money === 'function' ? money(book.price) : 'PKR ' + Number(book.price || 0).toLocaleString();
      const cls = book.cls || book.grade || 'All Grades';
      const pub = book.pub || book.school || book.author || 'Study Pack';

      item.innerHTML = `
        <div style="width:44px; height:56px; border-radius:6px; overflow:hidden; background:#f1f5f9; flex-shrink:0; border:1px solid #e2e8f0; display:flex; align-items:center; justify-content:center;">
          <img src="${img}" alt="${escapeHtml(book.title)}" style="width:100%; height:100%; object-fit:contain;" onerror="this.src='assets/images/studypack_logo.png'">
        </div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:13.5px; font-weight:600; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px;">${highlightMatch(book.title || '', query)}</div>
          <div style="font-size:11.5px; color:#64748B;">${escapeHtml(cls)} • ${escapeHtml(pub)}</div>
        </div>
        <div style="font-size:13.5px; font-weight:700; color:#1565C0; white-space:nowrap;">${price}</div>
      `;

      item.addEventListener("mouseenter", () => item.style.background = "#EFF6FF");
      item.addEventListener("mouseleave", () => item.style.background = "#ffffff");

      item.addEventListener("click", function(e) {
        e.preventDefault();
        dropdown.classList.remove("show");
        searchForm.classList.remove("expanded");
        
        // If on books page, apply filter instantly
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
          searchBox.value = book.title;
        }
        if (typeof window.applyFilters === 'function') {
          const urlParams = new URLSearchParams(window.location.search);
          urlParams.set('q', book.title);
          window.history.pushState({}, '', `${window.location.pathname}?${urlParams}`);
          window.applyFilters();
        } else {
          window.location.href = `books.html?q=${encodeURIComponent(book.title)}`;
        }
      });

      list.appendChild(item);
    });

    dropdown.appendChild(list);

    if (results.length > 8) {
      const footer = document.createElement("div");
      footer.style.cssText = "padding:10px 16px; background:#f8fafc; text-align:center; border-top:1px solid #e2e8f0;";
      footer.innerHTML = `<a href="books.html?q=${encodeURIComponent(query)}" style="font-size:12.5px; font-weight:700; color:#1565C0; text-decoration:none;">Tamam ${results.length} results dekhein &rarr;</a>`;
      dropdown.appendChild(footer);
    }

    dropdown.classList.add("show");
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeRegex(query);
    const regex = new RegExp(`(${escaped})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark style="background:#FEF08A; color:#854D0E; padding:0 2px; border-radius:2px;">$1</mark>');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

});