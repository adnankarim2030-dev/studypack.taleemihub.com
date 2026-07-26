import glob

for f in ['books.html', 'stationery.html', 'toys.html']:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if "filterCard.classList.remove('show')" not in content:
        # Find the applyFilters function and insert the close logic before the end
        target = "renderProducts(currentBooks);"
        replacement = """renderProducts(currentBooks);
  if(window.innerWidth <= 1080) {
    const fc = document.getElementById('filterCard');
    if(fc) fc.classList.remove('show');
  }"""
        content = content.replace(target, replacement)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print("Patched", f)
