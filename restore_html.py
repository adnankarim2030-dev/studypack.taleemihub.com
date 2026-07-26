import glob
import re

correct_html_nav = """<!-- Premium Glass Menu -->
<div id="glassMenu" class="glass-menu-overlay">
  <button id="glassCloseBtn" class="glass-close-btn" aria-label="Close Menu">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  </button>
  <div class="gm-links">
    <a href="index.html" class="gm-link"><span class="gm-text">Home</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    <a href="books.html" class="gm-link"><span class="gm-text">Books</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    <a href="stationery.html" class="gm-link"><span class="gm-text">Stationery</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    <a href="toys.html" class="gm-link"><span class="gm-text">Toys &amp; Gifts</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    <a href="express.html" class="gm-link"><span class="gm-text">Express Delivery</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    <a href="contact.html" class="gm-link"><span class="gm-text">Contact</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
  </div>
</div>
<div id="preloader">"""

js_patch = """
    // Add close button logic
    const glassCloseBtn = document.getElementById("glassCloseBtn");
    if(glassCloseBtn) {
      glassCloseBtn.addEventListener("click", function(e) {
        createRipple(e, glassCloseBtn);
        menuOpen = false;
        glassMenu.classList.remove("open");
        burgerIcon.innerHTML = '<path d="M3 12h18M3 6h18M3 18h18"/>';
      });
    }
"""

for file in glob.glob("*.html"):
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Restore the broken HTML structure
    content = re.sub(r'<!-- Premium Glass Menu -->.*?<div id="preloader">', correct_html_nav, content, flags=re.DOTALL)

    # 2. Add JS logic for the close button
    if "glassCloseBtn.addEventListener" not in content:
        content = content.replace('const gmLinks = document.querySelectorAll(".gm-link");', js_patch + '\n  const gmLinks = document.querySelectorAll(".gm-link");')

    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

# Update CSS for the close button
css_patch = """
/* Glass Menu Close Button */
.glass-close-btn {
  position: absolute; top: 24px; right: 24px; width: 44px; height: 44px;
  border-radius: 50%; background: rgba(255, 255, 255, 0.9);
  display: flex; align-items: center; justify-content: center;
  color: var(--navy); z-index: 10; box-shadow: 0 4px 14px rgba(0,0,0,0.1);
  transition: 0.3s;
}
.glass-close-btn:hover { background: var(--orange); color: #fff; transform: scale(1.1); }
.glass-close-btn svg { width: 24px; height: 24px; }
"""

with open("assets/css/global.css", "a", encoding="utf-8") as f:
    f.write("\\n" + css_patch + "\\n")

print("Restored glass menu and added close button.")
