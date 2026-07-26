import re

with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

parts = js_content.split('const STATIONERY = [')
if len(parts) > 1:
    stationery_block = parts[1]
    end_idx = stationery_block.find('];')
    array_content = stationery_block[:end_idx]
    remainder = stationery_block[end_idx:]
    
    items = array_content.split('  {')
    kept_items = []
    for item in items:
        if not item.strip():
            continue
        if 'https://placehold.co' not in item:
            kept_items.append('  {' + item)
            
    clean_array_content = ',\n'.join(kept_items).strip(',\n \t') + '\n'
    
    new_text = clean_array_content + remainder
    new_js = parts[0] + 'const STATIONERY = [\n' + new_text
    
    with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'w', encoding='utf-8') as f:
        f.write(new_js)
    print("Successfully deleted placeholder items from main.js")
