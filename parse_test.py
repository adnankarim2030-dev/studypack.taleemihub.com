import re
import math
from bs4 import BeautifulSoup

html = open('test_paramount.html', 'r', encoding='utf-8').read()
soup = BeautifulSoup(html, 'html.parser')

product_links = soup.find_all('a', href=re.compile(r'/collections/paramount-school-textbooks/products/'))
print(f"Found {len(product_links)} product links")

products = []
seen_titles = set()

for a in product_links:
    # Try to find title
    title_el = a.find('h3') or a.find('span', class_=re.compile(r'title|name', re.I))
    if not title_el:
        # Fallback: regex on text
        text = a.get_text(strip=True)
        # Text looks like: Add to cartVendor:Paramount BooksPARAMOUNT GRADED MATHEMATICS: BOOK 1Regular priceRs.375.00
        m = re.search(r'Books(.*?)(?:Regular price|Rs\.)', text)
        title = m.group(1).strip() if m else "Unknown"
    else:
        title = title_el.get_text(strip=True)
        
    if title == "Unknown" or not title:
        continue
        
    if title in seen_titles:
        continue
    seen_titles.add(title)

    # Price
    price_text = a.get_text(strip=True)
    pm = re.search(r'Rs\.([\d,]+)', price_text)
    if pm:
        price = float(pm.group(1).replace(',', ''))
    else:
        price = 0
        
    # Image
    img_el = a.find('img')
    img = ""
    if img_el:
        img = img_el.get('src') or img_el.get('data-src') or ""
        if img.startswith('//'):
            img = 'https:' + img
            
    products.append({
        'title': title,
        'price': price,
        'img': img
    })

print(f"Parsed {len(products)} products.")
for p in products[:3]:
    print(p)
