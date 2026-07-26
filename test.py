import re
html = open('f:/studypack.taleemihub.com/files (2)/toys_html.html', 'r', encoding='utf-8').read()
blocks = html.split('type-product')[1:3]
for item in blocks:
    title_match = re.search(r'<h3 class="product-title">.*?<a[^>]*>([^<]+)</a>', item, re.DOTALL)
    if not title_match:
        title_match = re.search(r'<h2 class="woocommerce-loop-product__title">([^<]+)</h2>', item)
    if not title_match:
        title_match = re.search(r'class="woocommerce-loop-product__title">([^<]+)</h2>', item)
    print("Title:", title_match.group(1).strip() if title_match else "None")
    
    price_str = "0"
    ins_match = re.search(r'<ins>.*?<bdi>.*?₨\s*</span>([\d,]+)</bdi>', item, re.DOTALL)
    if ins_match:
        price_str = ins_match.group(1).replace(',', '')
    else:
        price_match = re.search(r'<bdi><span class="woocommerce-Price-currencySymbol">₨\s*</span>([\d,]+)</bdi>', item)
        if price_match:
            price_str = price_match.group(1).replace(',', '')
    print("Price:", price_str)
    
    img_match = re.search(r'<img[^>]+src="([^"]+)"', item)
    print("Img:", img_match.group(1) if img_match else "None")
