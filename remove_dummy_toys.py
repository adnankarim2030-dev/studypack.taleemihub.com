import re

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
            if item_id >= 500: # ONLY keep scraped toys!
                kept_items.append('  {' + item)
            
    clean_array_content = ',\n'.join(kept_items).strip(',\n \t') + '\n'
    
    new_text = clean_array_content + remainder
    new_js = parts[0] + 'const TOYS = [\n' + new_text
    
    with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'w', encoding='utf-8') as f:
        f.write(new_js)
    print("Successfully deleted dummy items from TOYS")
