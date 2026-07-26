import re
import math
import urllib.request
from bs4 import BeautifulSoup

base_url = "https://paramountbooks.com.pk/collections/paramount-school-textbooks"

all_products = []
seen_titles = set()

# Fetch pages 4 to 19 (inclusive)
for page in range(4, 20):
    print(f"Fetching page {page}...")
    try:
        url = f"{base_url}?page={page}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        soup = BeautifulSoup(html, 'html.parser')
        
        product_links = soup.find_all('a', href=re.compile(r'/collections/paramount-school-textbooks/products/'))
        if not product_links:
            print("No product links on page", page)
            break
            
        for a in product_links:
            title_el = a.find('h3') or a.find('span', class_=re.compile(r'title|name', re.I))
            if not title_el:
                text = a.get_text(strip=True)
                m = re.search(r'Books(.*?)(?:Regular price|Rs\.)', text)
                title = m.group(1).strip() if m else "Unknown"
            else:
                title = title_el.get_text(strip=True)
                
            if title == "Unknown" or not title or title in seen_titles:
                continue
            seen_titles.add(title)

            price_text = a.get_text(strip=True)
            pm = re.search(r'Rs\.([\d,]+)', price_text)
            if pm:
                price = float(pm.group(1).replace(',', ''))
            else:
                price = 0
                
            img_el = a.find('img')
            img = ""
            if img_el:
                img = img_el.get('src') or img_el.get('data-src') or ""
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
    id_counter = 30100
    for p in all_products:
        original_price = p['price']
        new_price = math.ceil(original_price * 1.10) # add 10%
        
        obj = f"""  {{
    id: {id_counter},
    title: "{p['title']}",
    cls: "Course Books",
    subj: "Paramount books",
    price: {new_price},
    old: {int(original_price)},
    rating: 5,
    rv: 12,
    grad: "linear-gradient(135deg, #0B1220, #1c2536)",
    img: "{p['img']}",
    author: "Paramount",
    pub: "Paramount Books",
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
    print("Successfully added products to main.js!")
else:
    print("Could not find 'const BOOKS = [\\n' in main.js")
