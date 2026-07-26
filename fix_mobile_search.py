import glob
import re

for file in glob.glob("*.html"):
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove the gm-search-wrapper block
    content = re.sub(r'<div class="gm-search-wrapper".*?</div>\s*</div>', '</div>', content, flags=re.DOTALL)
    
    # Wait, my previous regex inserted it after <div class="gm-links">.
    # The actual HTML was:
    # <div class="gm-links">
    #   <div class="gm-search-wrapper" ...> ... </form> </div>
    # ...
    # So I need to carefully remove just the wrapper.
    content = re.sub(r'<div class="gm-search-wrapper".*?</form>\s*</div>\s*', '', content, flags=re.DOTALL)

    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

# Update CSS to show search bar on all pages on mobile
css_patch = """
/* Show search bar directly on pages on mobile */
@media (max-width: 900px) {
  header.nav .navbar {
    flex-wrap: wrap;
    padding: 12px 20px;
  }
  .nav-search-bar {
    display: flex !important;
    order: 3;
    width: 100%;
    max-width: 100%;
    margin: 12px 0 0 0;
  }
}
"""

with open("assets/css/global.css", "a", encoding="utf-8") as f:
    f.write("\\n" + css_patch + "\\n")

print("Mobile search bar moved to main layout.")
