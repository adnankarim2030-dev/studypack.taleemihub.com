import re
import urllib.request
import math

# Clean up existing scraped items in main.js
with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

parts = js_content.split('const STATIONERY = [')
if len(parts) > 1:
    stationery_block = parts[1]
    end_idx = stationery_block.find('];')
    array_content = stationery_block[:end_idx]
    remainder = stationery_block[end_idx:]
    
    # Filter out items with id >= 400
    items = array_content.split('  {')
    kept_items = []
    for item in items:
        if not item.strip():
            continue
        # Find id
        id_match = re.search(r'id:\s*(\d+)', item)
        if id_match:
            item_id = int(id_match.group(1))
            if item_id < 400:
                kept_items.append('  {' + item)
        else:
            kept_items.append('  {' + item)
            
    # Clean up the array format
    clean_array_content = ',\n'.join(kept_items).strip(',\n \t') + '\n'
    
    base_url = 'https://www.parasartfever.com/school-essentials'
    all_products = []

    for page in range(1, 15):
        print(f"Fetching page {page}...")
        try:
            url = f"{base_url}?p={page}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            html = urllib.request.urlopen(req).read().decode('utf-8')
            
            items_html = html.split('<li class="item product product-item">')[1:]
            
            if not items_html:
                break
                
            for item in items_html:
                # Title
                title_match = re.search(r'class="product-item-link"[^>]*>\s*(.*?)\s*</a>', item, re.DOTALL)
                title = title_match.group(1).strip() if title_match else "Unknown"
                
                # Price
                price_match = re.search(r'data-price-amount="([^"]+)"', item)
                price = float(price_match.group(1)) if price_match else 0
                
                # Image
                img_match = re.search(r'data-src="([^"]+)"', item)
                img = img_match.group(1) if img_match else ""
                
                if title != "Unknown":
                    all_products.append({
                        "title": title.replace('"', '\\"'),
                        "price": price,
                        "img": img
                    })
            
        except Exception as e:
            print("Error on page", page, e)
            break

    print(f"Scraped {len(all_products)} products.")

    new_stationery = []
    id_counter = 400
    for p in all_products:
        original_price = p['price']
        new_price = math.ceil(original_price * 1.15)
        
        obj = f"""  {{
    id: {id_counter},
    title: "{p['title']}",
    author: "Paras Art",
    pub: "Imported",
    cls: "Accessories",
    subj: "School Supplies",
    price: {new_price},
    old: {int(original_price)},
    rating: 5,
    rv: 10,
    tag: "new",
    stock: true,
    grad: "linear-gradient(160deg,#26a69a,#00695c)",
    img: "{p['img']}"
  }}"""
        new_stationery.append(obj)
        id_counter += 1

    if new_stationery:
        new_text = clean_array_content + ",\n" + ',\n'.join(new_stationery) + '\n' + remainder
        new_js = parts[0] + 'const STATIONERY = [\n' + new_text
        with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'w', encoding='utf-8') as f:
            f.write(new_js)
        print("Successfully cleaned up and appended scraped products to STATIONERY in main.js")
