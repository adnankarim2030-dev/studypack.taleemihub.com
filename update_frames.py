import re

card_template = """<div class="p-card" data-id="${b.id}">
      <div class="p-cover-wrap">
        <div class="p-cover" style="background:${b.img ? `url('${b.img}') center/cover no-repeat` : b.grad}">
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
          ${b.img ? '' : `<div class="p-title">${b.title}</div>`}
        </div>
      </div>
      <div class="p-meta"><span>${b.cls || 'Misc'}</span><span>${b.subj}</span></div>
      <div class="p-name">${b.title}</div>
      <div class="p-author">by ${b.author || 'Study Pack'} ${b.pub ? '· ' + b.pub : ''}</div>
      <div class="p-rating"><span class="stars">${starString(b.rating)}</span><span class="rv">${b.rating} (${b.rv})</span></div>
      <div class="p-stock"><span class="d" style="background:${b.stock!==false?'#2e7d32':'#c62828'}"></span>${b.stock!==false?'In Stock':'Out of Stock'}</div>
      <div class="p-price-row">
        <div class="p-price"><span class="now">${money(b.price)}</span>${b.old?'<span class="old">'+money(b.old)+'</span>':''}</div>
      </div>
      <div class="p-actions">
        <button class="btn-cart" onclick="addToCart(${b.id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg> Add to Cart</button>
        <button class="btn-buy" onclick="addToCart(${b.id}); openCart();">Buy Now</button>
      </div>
    </div>"""

files = ['f:/studypack.taleemihub.com/files (2)/stationery.html', 'f:/studypack.taleemihub.com/files (2)/toys.html']

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to replace the inside of grid.innerHTML = pageItems.map(b => `...`).join('');
    # Find the pattern
    pattern = r'(grid\.innerHTML = pageItems\.map\(b => `).*?(`\)\.join\(\'\'\);)'
    
    new_content, count = re.subn(pattern, r'\g<1>' + card_template.replace('\\', '\\\\') + r'\g<2>', content, flags=re.DOTALL)
    
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
    else:
        print(f"Failed to match pattern in {filepath}")
