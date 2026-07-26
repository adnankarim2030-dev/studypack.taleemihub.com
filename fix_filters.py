import re

with open("books.html", "r", encoding="utf-8") as f:
    content = f.read()

# We need to replace the applyFilters function body.
new_apply_filters = """function applyFilters(){
  const clsChecked = [...document.querySelectorAll('.f-cls:checked')].map(c=>c.value).filter(v=>v!=='all');
  const subjChecked = [...document.querySelectorAll('.f-subj:checked')].map(c=>c.value).filter(v=>v!=='all');
  
  const maxPrice = parseInt(document.getElementById('priceRange').value);
  const inStockOnly = document.getElementById('inStockOnly').checked;
  document.getElementById('priceVal').textContent = money(maxPrice);

  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';
  if(initialQuery && document.getElementById('searchInfo')) {
     document.getElementById('searchInfo').textContent = "Showing results for: '" + initialQuery + "'";
  }

  let list = BOOKS.filter(b=>{
    const safeCls = (b.cls || '').toLowerCase();
    const safeSubj = (b.subj || '').toLowerCase();
    const safeTitle = (b.title || '').toLowerCase();
    const safePub = (b.pub || '').toLowerCase();
    const safeAuthor = (b.author || '').toLowerCase();
    
    const clsMatch = clsChecked.length===0 || clsChecked.some(c=>safeCls.includes(c.toLowerCase()));
    
    const subjMatch = subjChecked.length===0 || subjChecked.some(c=>{
      const cLower = c.toLowerCase();
      
      const isCambridge = cLower.includes('cambridge') && (safeTitle.includes('cambridge') || safeSubj.includes('cambridge') || safePub.includes('cambridge') || safeAuthor.includes('cambridge'));
      const isOxford = cLower.includes('oxford') && (safeTitle.includes('oxford') || safeSubj.includes('oxford') || safePub.includes('oxford') || safeAuthor.includes('oxford'));
      const isParamount = cLower.includes('paramount') && (safeTitle.includes('paramount') || safeSubj.includes('paramount') || safePub.includes('paramount') || safeAuthor.includes('paramount'));
      
      let pubMatch = isCambridge || isOxford || isParamount;
      
      if (pubMatch) {
        const parts = cLower.split(' ');
        const subjPart = parts.length > 1 ? parts[1] : '';
        
        if (subjPart && subjPart !== 'books') {
          const subjectKeywords = {
             'math': ['math', 'countdown', 'calculus', 'algebra', 'geometry', 'number'],
             'english': ['english', 'grammar', 'literature', 'phonics', 'abc', 'reading'],
             'science': ['science', 'biology', 'chemistry', 'physics', 'world around', 'environment'],
             'urdu': ['urdu', 'likhai', 'qaida', 'mutalia'],
             'islamiyat': ['islam', 'islamiyat', 'islamic', 'quran', 'deen'],
             'computer': ['computer', 'it', 'keyboard', 'digital']
          };
          
          let matchesSubj = false;
          if (subjectKeywords[subjPart]) {
             matchesSubj = subjectKeywords[subjPart].some(kw => safeTitle.includes(kw) || safeSubj.includes(kw));
          } else {
             matchesSubj = safeTitle.includes(subjPart) || safeSubj.includes(subjPart);
          }
          
          if (!matchesSubj) {
            pubMatch = false;
          }
        }
      }
      
      return safeSubj.includes(cLower) || safeCls.includes(cLower) || pubMatch;
    });
    
    const priceMatch = b.price <= maxPrice;
    const stockMatch = !inStockOnly || b.stock !== false;
    
    const qTerms = initialQuery.toLowerCase().split(' ').filter(x=>x);
    const qMatch = qTerms.length === 0 || qTerms.every(t => safeTitle.includes(t) || safeCls.includes(t) || safeSubj.includes(t) || safePub.includes(t) || safeAuthor.includes(t));
    
    return clsMatch && subjMatch && priceMatch && stockMatch && qMatch;
  });

  const sort = document.getElementById('sortSelect').value;
  if(sort==='low') list.sort((a,b)=>a.price-b.price);
  else if(sort==='high') list.sort((a,b)=>b.price-a.price);
  else if(sort==='rating') list.sort((a,b)=>b.rating-a.rating);

  currentBooks = list;
  currentPage = 1;
  renderProducts(currentBooks);
  if(window.innerWidth <= 1080) {
    const fc = document.getElementById('filterCard');
    if(fc) fc.classList.remove('show');
  }
}"""

# Use regex to replace the function definition
content = re.sub(r'function applyFilters\(\)\{.*?if\(window\.innerWidth <= 1080\) \{\n    const fc = document\.getElementById\(\'filterCard\'\);\n    if\(fc\) fc\.classList\.remove\(\'show\'\);\n  \}\n\}', new_apply_filters, content, flags=re.DOTALL)

with open("books.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed applyFilters in books.html")
