import re
import urllib.request
from bs4 import BeautifulSoup

base_url = "https://oup.com.pk/school-textbooks.html"

all_products = []
seen_titles = set()

# Fetch a few pages
for page in range(1, 4):
    print(f"Fetching page {page}...")
    try:
        url = f"{base_url}?p={page}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        soup = BeautifulSoup(html, 'html.parser')
        
        contents = soup.find_all('div', class_=re.compile(r'product_content|product-item-details'))
        if not contents:
            break
            
        for content in contents:
            parent = content.parent
            if not parent: continue
            
            title_el = content.find('a', class_=re.compile(r'product-item-link'))
            if title_el:
                title = title_el.get_text(strip=True)
            else:
                t = content.find('h2') or content.find('h3') or content.find(class_=re.compile(r'name|title', re.I))
                title = t.get_text(strip=True) if t else "Unknown"
                
            if title == "Unknown" or not title or title in seen_titles:
                continue
            seen_titles.add(title)

            price_el = content.find('span', class_='price')
            if price_el:
                p_text = price_el.get_text(strip=True)
                pm = re.search(r'([\d,]+)', p_text)
                price = float(pm.group(1).replace(',', '')) if pm else 0
            else:
                price = 0
                
            img_el = parent.find('img')
            img = img_el.get('src') if img_el else ""
            if img.startswith('//'):
                img = 'https:' + img
                
            if price > 0:
                all_products.append({
                    'title': title.replace('"', '\\"'),
                    'price': price,
                    'img': img
                })
    except Exception as e:
        print("Error fetching page:", e)
        break

print(f"Scraped {len(all_products)} products.")

# Read main.js
filepath = 'f:/studypack.taleemihub.com/files (2)/assets/js/main.js'
with open(filepath, 'r', encoding='utf-8') as f:
    js_content = f.read()

parts = js_content.split('const BOOKS = [\n')
if len(parts) == 2:
    new_books_str = ""
    id_counter = 40000
    for p in all_products:
        original_price = p['price']
        
        obj = f"""  {{
    id: {id_counter},
    title: "{p['title']}",
    cls: "Course Books",
    subj: "Oxford books",
    price: {original_price},
    old: {int(original_price * 1.1)},
    rating: 5,
    rv: 12,
    grad: "linear-gradient(135deg, #0B1220, #1c2536)",
    img: "{p['img']}",
    author: "Oxford",
    pub: "Oxford University Press",
    pages: 150,
    fmt: "Print Book",
    tag: "new"
  }},
"""
        new_books_str += obj
        id_counter += 1
        
    new_js = parts[0] + 'const BOOKS = [\n' + new_books_str + parts[1]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_js)
    print("Successfully added Oxford products to main.js!")
else:
    print("Could not find 'const BOOKS = [\\n' in main.js")

