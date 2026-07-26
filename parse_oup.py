import re
from bs4 import BeautifulSoup

html = open('test_oup.html', 'r', encoding='utf-8').read()
soup = BeautifulSoup(html, 'html.parser')

products = []
for content in soup.find_all('div', class_=re.compile(r'product_content|product-item-details')):
    parent = content.parent
    if not parent: continue
    
    title_el = content.find('a', class_=re.compile(r'product-item-link'))
    if title_el:
        title = title_el.get_text(strip=True)
    else:
        # Fallback
        t = content.find('h2') or content.find('h3') or content.find(class_=re.compile(r'name|title', re.I))
        title = t.get_text(strip=True) if t else "Unknown"
        
    price_el = content.find('span', class_='price')
    if price_el:
        p_text = price_el.get_text(strip=True)
        pm = re.search(r'([\d,]+)', p_text)
        price = float(pm.group(1).replace(',', '')) if pm else 0
    else:
        price = 0
        
    # Image might be outside product_content, in the sibling
    img_el = parent.find('img')
    img = img_el.get('src') if img_el else ""
    
    products.append({'title': title, 'price': price, 'img': img})

print(f"Found {len(products)} products")
for p in products[:3]:
    print(p)
