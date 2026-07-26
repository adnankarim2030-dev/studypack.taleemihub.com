import glob
import re

for file in glob.glob("*.html"):
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # The hero search bar
    hero_search_pattern = r'<form class="search-bar reveal".*?</form>\s*'
    
    if re.search(hero_search_pattern, content, flags=re.DOTALL):
        content = re.sub(hero_search_pattern, '', content, flags=re.DOTALL)
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)

print("Hero search bar removed.")
