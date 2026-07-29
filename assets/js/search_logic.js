document.addEventListener("DOMContentLoaded", function() {
  const searchForm = document.querySelector(".nav-search-bar");
  if(!searchForm) return;

  const searchInput = searchForm.querySelector("input");
  
  // Create Dropdown Container
  const dropdown = document.createElement("div");
  dropdown.className = "ai-search-dropdown";
  searchForm.appendChild(dropdown);

  let searchTimeout;

  // Search logic
  searchInput.addEventListener("input", function(e) {
    clearTimeout(searchTimeout);
    const rawQuery = e.target.value.toLowerCase().trim(); const ignoreWords = ['ki', 'ka', 'ke', 'ko', 'mai', 'in', 'of', 'for', 'book', 'books', 'the', 'a', 'an', 'kitab', 'kitabein']; let query = rawQuery.split(' ').filter(x => x && !ignoreWords.includes(x)).join(' '); if (!query) query = rawQuery; // fallback to original if all are stop words
    
    if(query.length < 2) {
      dropdown.classList.remove("show");
      searchForm.classList.remove("expanded");
      return;
    }

    // Expand animation
    searchForm.classList.add("expanded");

    searchTimeout = setTimeout(() => {
      // Search against the global BOOKS array from main.js
      const results = (typeof BOOKS !== 'undefined' ? BOOKS : []).filter(book => {
        const title = (book.title || '').toLowerCase();
        const author = (book.author || '').toLowerCase();
        const subj = (book.subj || '').toLowerCase();
        const pub = (book.pub || '').toLowerCase();
        const cls = (book.cls || '').toLowerCase();
        
        return title.includes(query) || author.includes(query) || subj.includes(query) || pub.includes(query) || cls.includes(query);
      });
      
      renderResults(results, query);
    }, 300);
  });

  // Close when clicking outside
  document.addEventListener("click", function(e) {
    if(!searchForm.contains(e.target)) {
      dropdown.classList.remove("show");
      searchForm.classList.remove("expanded");
    }
  });

  searchInput.addEventListener("focus", function() {
    if(this.value.trim().length >= 2) {
      dropdown.classList.add("show");
      searchForm.classList.add("expanded");
    }
  });

  function renderResults(results, query) {
    dropdown.innerHTML = "";
    if(results.length === 0) {
      dropdown.innerHTML = `<div class="no-results">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>No books found for "<b>${query}</b>"</p>
        <span>Try searching by subject or class.</span>
      </div>`;
    } else {
      results.slice(0, 5).forEach(book => {
        const item = document.createElement("a");
        item.href = `book-details.html?id=${book.id}`;
        item.className = "search-result-item";
        
        // Handle cases where the book has no image
        const imgHtml = book.img 
          ? `<img src="${book.img}" alt="${book.title}">`
          : `<div style="width:100%; height:100%; background:${book.grad || '#eee'}; display:flex; align-items:center; justify-content:center; padding: 4px; text-align:center; font-size:10px; color:#fff; word-break:break-word;">${book.title}</div>`;

        const inStock = book.stock !== false;
        
        item.innerHTML = `
          <div class="sr-thumb">
            ${imgHtml}
          </div>
          <div class="sr-info">
            <h5 class="sr-title" style="white-space: normal; line-height: 1.4;">${highlightMatch(book.title, query)}</h5>
            <div class="sr-meta">
              <span>${book.pub || 'Study Pack'}</span> • <span>${book.cls || 'Misc'}</span> • <span>${book.subj || 'General'}</span>
            </div>
            <div class="sr-bot">
              <span class="sr-price">Rs ${book.price}</span>
              ${inStock ? '<span class="sr-stock in-stock">In Stock</span>' : '<span class="sr-stock out-stock">Out of Stock</span>'}
            </div>
          </div>
        `;
        dropdown.appendChild(item);
      });
      
      if(results.length > 5) {
        const viewAll = document.createElement("a");
        viewAll.href = `books.html?q=${encodeURIComponent(query)}`;
        viewAll.className = "sr-view-all";
        viewAll.innerText = `View all ${results.length} results →`;
        dropdown.appendChild(viewAll);
      }
    }
    dropdown.classList.add("show");
  }

  function highlightMatch(text, query) {
    if (!text) return "";
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }
});
