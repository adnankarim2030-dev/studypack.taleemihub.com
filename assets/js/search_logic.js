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

  // Handle Input with Smart Stemming & Synonyms
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
      const catalog = (typeof BOOKS !== 'undefined' && BOOKS.length > 0) 
        ? BOOKS 
        : ((typeof SCRAPED_BOOKS !== 'undefined' && SCRAPED_BOOKS.length > 0) ? SCRAPED_BOOKS : []);

      // Smart synonyms mapping
      let searchTerms = [rawQuery];
      if (rawQuery === 'maths' || rawQuery === 'math') {
        searchTerms.push('math', 'mathematics', 'countdown', 'hisab');
      } else if (rawQuery === 'bio') {
        searchTerms.push('biology', 'science');
      } else if (rawQuery === 'chem') {
        searchTerms.push('chemistry', 'science');
      } else if (rawQuery === 'phy') {
        searchTerms.push('physics', 'science');
      } else if (rawQuery === 'eng') {
        searchTerms.push('english', 'oxford');
      } else if (rawQuery === 'islamiat' || rawQuery === 'islam') {
        searchTerms.push('islamic', 'islam', 'quran');
      } else if (rawQuery === 'comp') {
        searchTerms.push('computer', 'it');
      }

      const results = catalog.filter(book => {
        const title = (book.title || book.name || '').toLowerCase();
        const author = (book.author || book.brand || '').toLowerCase();
        const subj = (Array.isArray(book.subj) ? book.subj.join(' ') : (book.subj || '')).toLowerCase();
        const pub = (book.pub || '').toLowerCase();
        const cls = (Array.isArray(book.cls) ? book.cls.join(' ') : (book.cls || '')).toLowerCase();
        const fullStr = `${title} ${author} ${subj} ${pub} ${cls}`;

        return searchTerms.some(term => fullStr.includes(term));
      });

      renderResults(results, rawQuery);
    }, 200);
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
        <div class="ai-empty-state">
          <div class="ai-empty-icon">!</div>
          <div class="ai-empty-text">No items found for "<strong>${escapeHtml(query)}</strong>"</div>
          <div class="ai-empty-sub">Class, subject (e.g. Math, Oxford, Science, Urdu) search karein.</div>
        </div>
      `;
      dropdown.classList.add("show");
      return;
    }

    const header = document.createElement("div");
    header.className = "ai-search-header";
    header.innerHTML = `<span>Found ${results.length} results</span><span class="ai-badge">StudyPack Search</span>`;
    dropdown.appendChild(header);

    const list = document.createElement("div");
    list.className = "ai-results-list";

    results.slice(0, 6).forEach(book => {
      const item = document.createElement("a");
      item.href = `books.html?q=${encodeURIComponent(book.title || '')}`;
      item.className = "ai-search-item";
      
      const img = book.img || 'assets/images/logo.png';
      const price = typeof money === 'function' ? money(book.price) : 'PKR ' + (book.price || 0).toLocaleString();
      const cls = book.cls || 'All Grades';
      const pub = book.pub || book.author || '';

      item.innerHTML = `
        <img src="${img}" alt="${escapeHtml(book.title)}" class="ai-item-thumb" onerror="this.src='assets/images/logo.png'">
        <div class="ai-item-info">
          <div class="ai-item-title">${highlightMatch(book.title || '', query)}</div>
          <div class="ai-item-meta">${escapeHtml(cls)} • ${escapeHtml(pub)}</div>
        </div>
        <div class="ai-item-price">${price}</div>
      `;

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

    if (results.length > 6) {
      const footer = document.createElement("div");
      footer.className = "ai-search-footer";
      footer.innerHTML = `<a href="books.html?q=${encodeURIComponent(query)}">Tamam ${results.length} results dekhein &rarr;</a>`;
      dropdown.appendChild(footer);
    }

    dropdown.classList.add("show");
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeRegex(query);
    const regex = new RegExp(`(${escaped})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark>$1</mark>');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

});
