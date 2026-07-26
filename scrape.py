import urllib.request
import re
import base64
import os

url = 'https://www.google.com/search?q=wholesale+stationery+shops+in+karachi+with+price&sca_esv=15584491b0e529db&biw=1920&bih=945&sxsrf=APpeQntU-k5I41hJKlnroddfDWzPe0rtbA%3A1784575641315&ei=mXZeavDpEt24kdUP15nK2QY&oq=stationery+shops+in+karachi+whole+sale&gs_lp=Egxnd3Mtd2l6LXNlcnAiJnN0YXRpb25lcnkgc2hvcHMgaW4ga2FyYWNoaSB3aG9sZSBzYWxlKgIIATIIEAAYCBgeGA0yCBAAGAgYHhgNMggQABgIGB4YDTILEAAYgAQYigUYhgMyCxAAGIAEGIoFGIYDMgsQABiABBiKBRiGAzIIEAAYgAQYogQyBRAAGO8FSNyIAVCNBFiOZXAGeAGQAQCYAe0BoAHVFqoBBTAuNi44uAEDyAEA-AEBmAIUoALsF8ICChAAGEcY1gQYsAPCAgYQABgWGB7CAggQABgWGB4YCsICBRAhGJ8FmAMAiAYBkAYIkgcGNi4yLjEyoAf3XLIHBjAuMi4xMrgHwhfCBwgwLjIuMTUuM8gHbIAIAQ&sclient=gws-wiz-serp'

req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'}
)

with urllib.request.urlopen(req) as response:
    html = response.read().decode('utf-8')

images = re.findall(r"'(data:image/(?:jpeg|png|gif);base64,([^']+))'", html)
if not images:
    images = re.findall(r'"(data:image/(?:jpeg|png|gif);base64,([^"]+))"', html)

print(f"Found {len(images)} images in Google Search.")

os.makedirs('f:/studypack.taleemihub.com/files (2)/assets/images/scraped', exist_ok=True)

saved_images = []
for i, (full_data, b64_str) in enumerate(images[:20]):
    try:
        # Pad base64 if necessary
        b64_str = b64_str.replace('\\x3d', '=') # some json escapes in Google results
        img_data = base64.b64decode(b64_str)
        ext = 'jpg' if 'jpeg' in full_data else 'png'
        filename = f"scraped/stat_{i}.{ext}"
        filepath = f"f:/studypack.taleemihub.com/files (2)/assets/images/{filename}"
        with open(filepath, 'wb') as f:
            f.write(img_data)
        saved_images.append(f"assets/images/{filename}")
    except Exception as e:
        print(f"Failed to save image {i}: {e}")

print(f"Successfully saved {len(saved_images)} images.")

if saved_images:
    with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'r', encoding='utf-8') as f:
        js_content = f.read()

    parts = js_content.split('const STATIONERY = [')
    if len(parts) > 1:
        stationery_text = parts[1]
        items = stationery_text.split('  {')
        
        new_items = []
        img_index = 0
        for item in items:
            if not item.strip():
                new_items.append(item)
                continue
            
            if img_index < len(saved_images):
                new_img = saved_images[img_index]
                if 'img: ' in item:
                    item = re.sub(r'img:\s*".*?"', f'img: "{new_img}"', item)
                else:
                    item = re.sub(r'\n  }', f',\n    img: "{new_img}"\n  }}', item)
                img_index += 1
            new_items.append(item)
            
        new_stationery_text = '  {'.join(new_items)
        js_content = parts[0] + 'const STATIONERY = [' + new_stationery_text
        
        with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'w', encoding='utf-8') as f:
            f.write(js_content)
        print("Updated main.js with scraped images.")
    else:
        print("Could not find STATIONERY array.")
