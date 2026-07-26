import json
import re

print("Loading prices_map.json...")
try:
    with open('f:/studypack.taleemihub.com/files (2)/prices_map.json', 'r', encoding='utf-8') as f:
        prices_map = json.load(f)
except Exception as e:
    print("Error loading prices_map.json:", e)
    exit(1)

print(f"Loaded {len(prices_map)} prices.")

js_file = 'f:/studypack.taleemihub.com/files (2)/assets/js/main.js'
with open(js_file, 'r', encoding='utf-8') as f:
    text = f.read()

# We need to find all objects that have `subj: "The Educators ..."` and update their price.
# But `prices_map` maps title to price.
# The title is in the format `title: "...",`

def replacer(match):
    full_block = match.group(0)
    title_match = re.search(r'title:\s*"([^"]+)"', full_block)
    if not title_match:
        return full_block
    
    title = title_match.group(1)
    if title in prices_map:
        new_price = prices_map[title]
        # Replace price: 0 with price: new_price
        new_block = re.sub(r'price:\s*0\b', f'price: {new_price}', full_block)
        return new_block
    return full_block

# We can match every object `{ id: ..., title: "...", ..., classes: [...] }`
new_text = re.sub(r'\{\s*id:\s*5\d{4},.*?classes:\s*\[.*?\]\s*\}', replacer, text, flags=re.DOTALL)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Injected prices into main.js!")
