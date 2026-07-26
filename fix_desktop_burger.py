import glob
import re

css_patch = """
/* Hide burger button on desktop */
@media (min-width: 761px) {
  .top-burger-btn, #topBurger {
    display: none !important;
  }
}
"""

# 1. Update CSS
with open("assets/css/global.css", "a", encoding="utf-8") as f:
    f.write("\\n" + css_patch + "\\n")

# 2. Update HTML for inline close button styling
close_btn_old = r'<button id="glassCloseBtn" class="glass-close-btn" aria-label="Close Menu">.*?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>\s*</button>'

close_btn_new = """<button id="glassCloseBtn" class="glass-close-btn" aria-label="Close Menu" style="position: absolute; top: 24px; right: 24px; width: 44px; height: 44px; border-radius: 50%; background: #ffffff; display: flex; align-items: center; justify-content: center; color: #111827; z-index: 100; box-shadow: 0 4px 14px rgba(0,0,0,0.15); border: none; cursor: pointer; transition: 0.3s;">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 24px; height: 24px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  </button>"""

for file in glob.glob("*.html"):
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # The regex might fail if formatting is slightly different, let's just do a simpler replace
    if '<button id="glassCloseBtn"' in content:
        # We can extract and replace the button
        content = re.sub(r'<button id="glassCloseBtn".*?</button>', close_btn_new, content, flags=re.DOTALL)
        
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

print("Fixed desktop burger button visibility and close button styling.")
