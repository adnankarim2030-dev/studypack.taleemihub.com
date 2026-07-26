import re
import urllib.request
import math

# Clean up TOYS array in main.js
with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

parts = js_content.split('const TOYS = [')
if len(parts) > 1:
    toys_block = parts[1]
    end_idx = toys_block.find('];')
    array_content = toys_block[:end_idx]
    remainder = toys_block[end_idx:]
    
    items = array_content.split('  {')
    kept_items = []
    for item in items:
        if not item.strip():
            continue
        id_match = re.search(r'id:\s*(\d+)', item)
        if id_match:
            item_id = int(id_match.group(1))
            if item_id < 500:
                kept_items.append('  {' + item)
        else:
            kept_items.append('  {' + item)
            
    clean_array_content = ',\n'.join(kept_items).strip(',\n \t') + '\n'
    
    base_url = 'https://www.educationaltoys.pk/shop/page/'
    all_products = []

    for page in range(1, 15):
        print(f"Fetching page {page}...")
        try:
            url = f"{base_url}{page}/" if page > 1 else 'https://www.educationaltoys.pk/shop/'
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            html = urllib.request.urlopen(req).read().decode('utf-8')
            
            blocks = html.split('type-product')[1:]
            
            if not blocks:
                break
                
            for item in blocks:
                # Title
                title_match = re.search(r'class="ip-shop-loop-title">([^<]+)</a>', item)
                title = title_match.group(1).strip() if title_match else "Unknown"
                title = title.replace('&#8211;', '-')
                title = title.replace('&#8217;', "'")
                
                # Price 
                price_str = "0"
                ins_match = re.search(r'<ins>.*?&#8360;</span>&nbsp;([\d,]+)</bdi>', item, re.DOTALL)
                if ins_match:
                    price_str = ins_match.group(1).replace(',', '')
                else:
                    price_match = re.search(r'&#8360;</span>&nbsp;([\d,]+)</bdi>', item)
                    if price_match:
                        price_str = price_match.group(1).replace(',', '')
                
                price = float(price_str)
                
                # Image
                img_match = re.search(r'<img[^>]+src="([^"]+)"', item)
                img = img_match.group(1) if img_match else ""
                
                if title != "Unknown" and price > 0:
                    all_products.append({
                        "title": title.replace('"', '\\"'),
                        "price": price,
                        "img": img
                    })
            
        except Exception as e:
            print("Finished scraping or encountered error on page", page, ":", e)
            break

    print(f"Scraped {len(all_products)} products.")

    new_toys = []
    id_counter = 500
    for p in all_products:
        original_price = p['price']
        new_price = math.ceil(original_price * 1.15)
        
        obj = f"""  {{
    id: {id_counter},
    title: "{p['title']}",
    author: "EduToys",
    pub: "Imported",
    cls: "Educational",
    subj: "Kids Toys",
    price: {new_price},
    old: {int(original_price)},
    rating: 5,
    rv: 10,
    tag: "new",
    stock: true,
    grad: "linear-gradient(160deg,#ab47bc,#7b1fa2)",
    img: "{p['img']}"
  }}"""
        new_toys.append(obj)
        id_counter += 1

    if new_toys:
        new_text = clean_array_content + ",\n" + ',\n'.join(new_toys) + '\n' + remainder
        new_js = parts[0] + 'const TOYS = [\n' + new_text
        with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'w', encoding='utf-8') as f:
            f.write(new_js)
        print("Successfully scraped toys and appended to main.js")
