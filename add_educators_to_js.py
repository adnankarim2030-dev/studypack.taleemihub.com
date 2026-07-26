import json
import re
import math

filepath = 'f:/studypack.taleemihub.com/files (2)/assets/js/main.js'

with open('f:/studypack.taleemihub.com/files (2)/educators_products_mapped_fix.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} mapped products from educators_products_mapped_fix.json")

with open(filepath, 'r', encoding='utf-8') as f:
    js_content = f.read()

parts = js_content.split('const BOOKS = [\n')
if len(parts) == 2:
    new_books_str = ""
    id_counter = 50000
    
    for p in products:
        title = str(p.get('title') or 'Unknown Book').replace('"', '\\"')
        price = p.get('price') or 0
        img = p.get('img') or ""
        regions = json.dumps(p.get('regions', []))
        classes = json.dumps(p.get('classes', []))
        
        # Determine Subject using word boundaries to prevent substring matches like 'it' in 'edition'
        lower_title = title.lower()
        if re.search(r'\b(math|countdown|calculus|algebra|geometry)\b', lower_title):
            subj = "The Educators Math"
        elif re.search(r'\b(english|grammar|literature|phonics)\b', lower_title):
            subj = "The Educators English"
        elif re.search(r'\b(science|biology|chemistry|physics|world around|environment)\b', lower_title):
            subj = "The Educators Science"
        elif re.search(r'\b(urdu|likhai|qaida|mutalia)\b', lower_title):
            subj = "The Educators Urdu"
        elif re.search(r'\b(islam|islamiyat|quran|deen)\b', lower_title):
            subj = "The Educators Islamiyat"
        elif re.search(r'\b(computer|it|digital)\b', lower_title):
            subj = "The Educators Computer"
        else:
            if 'waqfiyat' in lower_title:
                subj = "The Educators Science"
            else:
                subj = "The Educators Books"
            
        new_price = math.ceil(price * 1.10) if price > 0 else 0
        
        obj = f"""  {{
    id: {id_counter},
    title: "{title}",
    cls: "Course Books",
    subj: "{subj}",
    price: {new_price},
    old: {int(price)},
    rating: 5,
    rv: 12,
    grad: "linear-gradient(135deg, #0B1220, #1c2536)",
    img: "{img}",
    author: "The Educators",
    pub: "The Educators",
    pages: 100,
    fmt: "Print Book",
    tag: "new",
    regions: {regions},
    classes: {classes}
  }},
"""
        new_books_str += obj
        id_counter += 1
        
    new_js = parts[0] + 'const BOOKS = [\n' + new_books_str + parts[1]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_js)
    print("Successfully added mapped products to main.js!")
else:
    print("Could not find 'const BOOKS = [\\n' in main.js")
