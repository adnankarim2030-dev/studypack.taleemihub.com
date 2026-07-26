import glob
files = glob.glob('*.html')
style_injection = """
<style>
/* ABSOLUTE MOBILE GRID FIX */
@media (max-width: 760px) {
  .shop-product-grid, .product-grid, .ebook-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
  }
}
</style>
"""

for f in files:
    content = open(f, encoding='utf-8').read()
    if "ABSOLUTE MOBILE GRID FIX" not in content:
        content = content.replace('</head>', style_injection + '</head>')
        open(f, 'w', encoding='utf-8').write(content)
        print("Updated", f)
