import re
import urllib.parse

with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

parts = js_content.split('const STATIONERY = [')
if len(parts) > 1:
    stationery_text = parts[1]
    items = stationery_text.split('  {')
    
    new_items = []
    for item in items:
        if not item.strip():
            new_items.append(item)
            continue
        
        # Check if item has img
        if 'img:' not in item:
            # Extract title
            title_match = re.search(r'title:\s*"(.*?)"', item)
            if title_match:
                title = title_match.group(1)
                encoded_title = urllib.parse.quote(title)
                # Extract grad colors or use default
                bg = 'eee'
                fg = '333'
                placeholder = f"https://placehold.co/400x400/{bg}/{fg}?text={encoded_title}"
                item = re.sub(r'\n  }', f',\n    img: "{placeholder}"\n  }}', item)
        new_items.append(item)
        
    new_stationery_text = '  {'.join(new_items)
    js_content = parts[0] + 'const STATIONERY = [' + new_stationery_text
    
    with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("Updated main.js with placeholder images for missing ones.")
else:
    print("Could not find STATIONERY array.")
