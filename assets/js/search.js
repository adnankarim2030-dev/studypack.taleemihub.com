document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.search-bar, .nav-search-bar');
  
  // Extract all unique subjects and classes from BOOKS for faster suggestion
  let uniqueSubjects = [];
  let uniqueClasses = [];
  if (typeof BOOKS !== 'undefined') {
    uniqueSubjects = [...new Set(BOOKS.map(b => b.subj).filter(Boolean))];
    uniqueClasses = [...new Set(BOOKS.map(b => b.cls).filter(Boolean))];
  }

  forms.forEach(form => {
    form.style.position = 'relative'; // Ensure dropdown positions correctly
    
    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    form.appendChild(dropdown);

    const input = form.querySelector('input');
    
    // Handle form submit
    form.onsubmit = (e) => {
      e.preventDefault();
      if (input && input.value.trim()) {
        window.location.href = `books.html?q=${encodeURIComponent(input.value.trim())}`;
      } else {
        window.location.href = 'books.html';
      }
    };

    // Autocomplete logic
    if (input && typeof BOOKS !== 'undefined') {
      input.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        dropdown.innerHTML = '';
        
        if (!q) {
          dropdown.classList.remove('show');
          return;
        }

        const terms = q.split(' ').filter(x=>x);
        const suggestions = [];

        // 1. Match Subjects
        const matchedSubj = uniqueSubjects.filter(s => s.toLowerCase().includes(q)).slice(0, 3);
        matchedSubj.forEach(s => suggestions.push({ text: s, type: 'Subject', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' }));

        // 2. Match Classes
        const matchedCls = uniqueClasses.filter(c => terms.every(t => c.toLowerCase().includes(t))).slice(0, 2);
        matchedCls.forEach(c => suggestions.push({ text: c, type: 'Level', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' }));

        // 3. Match Book Titles
        const matchedBooks = BOOKS.filter(b => {
          const safeTitle = b.title ? b.title.toLowerCase() : '';
          const safeSubj = b.subj ? b.subj.toLowerCase() : '';
          const safeCls = b.cls ? b.cls.toLowerCase() : '';
          return terms.every(t => safeTitle.includes(t) || safeSubj.includes(t) || safeCls.includes(t));
        }).slice(0, 5);
        matchedBooks.forEach(b => suggestions.push({ text: b.title, type: 'Book', url: `books.html?q=${encodeURIComponent(b.title)}`, icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' }));

        if (suggestions.length === 0) {
          dropdown.innerHTML = `<div class="ac-item empty">No results found for "${e.target.value}"</div>`;
        } else {
          suggestions.forEach(s => {
            const item = document.createElement('div');
            item.className = 'ac-item';
            item.innerHTML = `
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${s.icon}"/></svg>
              <div class="ac-text">
                <span class="ac-title">${highlight(s.text, q)}</span>
                <span class="ac-type">${s.type}</span>
              </div>
            `;
            item.addEventListener('click', () => {
              if (s.url) {
                window.location.href = s.url;
              } else {
                input.value = s.text;
                form.dispatchEvent(new Event('submit'));
              }
            });
            dropdown.appendChild(item);
          });
        }
        dropdown.classList.add('show');
      });

      // Hide dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!form.contains(e.target)) {
          dropdown.classList.remove('show');
        }
      });
      
      // Show again on focus if there's text
      input.addEventListener('focus', () => {
        if (input.value.trim() && dropdown.children.length > 0) {
          dropdown.classList.add('show');
        }
      });
    }
  });

  function highlight(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }
});