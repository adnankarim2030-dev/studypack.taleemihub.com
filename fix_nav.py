import os
import glob
import re

html_nav = """<!-- Premium Glass Menu -->
<div id="glassMenu" class="glass-menu-overlay">
  <div class="gm-links">
    <a href="index.html" class="gm-link"><span class="gm-text">Home</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    <a href="books.html" class="gm-link"><span class="gm-text">Books</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    <a href="stationery.html" class="gm-link"><span class="gm-text">Stationery</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    <a href="toys.html" class="gm-link"><span class="gm-text">Toys &amp; Gifts</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    <a href="express.html" class="gm-link"><span class="gm-text">Express Delivery</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    <a href="contact.html" class="gm-link"><span class="gm-text">Contact</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
  </div>
</div>
"""

js_code = """<!-- Mobile Nav JS -->
<script>
document.addEventListener("DOMContentLoaded", function() {
  const topBurger = document.getElementById("topBurger");
  const glassMenu = document.getElementById("glassMenu");
  if(topBurger && glassMenu) {
    const burgerIcon = topBurger.querySelector("svg");
    let menuOpen = false;

    topBurger.addEventListener("click", function(e) {
      createRipple(e, topBurger);
      menuOpen = !menuOpen;
      if(menuOpen) {
        glassMenu.classList.add("open");
        burgerIcon.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
      } else {
        glassMenu.classList.remove("open");
        burgerIcon.innerHTML = '<path d="M3 12h18M3 6h18M3 18h18"/>';
      }
    });
  }

  const gmLinks = document.querySelectorAll(".gm-link");
  gmLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      createRipple(e, link);
    });
  });

  function createRipple(event, element) {
    const circle = document.createElement("span");
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - radius;
    const y = event.clientY - rect.top - radius;
    
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.classList.add("ripple");
    
    const existing = element.querySelector(".ripple");
    if(existing) existing.remove();
    
    element.appendChild(circle);
  }
});
</script>"""

nav_actions_new = """<div class="nav-actions">
        <a href="#" class="icon-btn" aria-label="Profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </a>
        <button class="icon-btn" id="cartBtn" aria-label="Cart" onclick="document.getElementById('cartDrawer').classList.add('show'); document.getElementById('cartOverlay').classList.add('show');">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
          <span class="badge-count" id="cartCount">0</span>
        </button>
        <button class="icon-btn top-burger-btn" id="topBurger" aria-label="Menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
      </div>"""

for file in glob.glob("*.html"):
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # Restore missing <body> tag
    content = content.replace("\\1\n", "<body>\n")
    content = content.replace("\\1", "<body>\n")
    
    # Remove old bottom dock and old glass menu
    content = re.sub(r'<!-- Premium Bottom Dock & Glass Menu -->.*?(?=<div id="preloader">)', html_nav + '\n', content, flags=re.DOTALL)
    
    # Update top nav actions
    content = re.sub(r'<div class="nav-actions">.*?</div>', nav_actions_new, content, flags=re.DOTALL)
    
    # Update JS
    if '<!-- Mobile Nav JS -->' in content:
        content = re.sub(r'<!-- Mobile Nav JS -->.*?</body>', js_code + '\n</body>', content, flags=re.DOTALL)

    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

# Update CSS
css_patch = """
/* Fix for Top Nav Actions */
.top-burger-btn {
  background: linear-gradient(135deg, var(--blue), var(--orange)) !important;
  box-shadow: 0 4px 14px rgba(255, 111, 0, 0.3) !important;
  color: white !important;
  position: relative;
  overflow: hidden;
}
.top-burger-btn:hover {
  transform: scale(1.05) !important;
}
.bottom-dock { display: none !important; }
@media (max-width: 760px) {
  header.nav .top-burger-btn { display: flex !important; }
  .btn-shop { display: none !important; }
}
"""

with open("assets/css/global.css", "r", encoding="utf-8") as f:
    css_content = f.read()

# Make sure burger display block is overridden
css_content = css_content.replace("header.nav .burger { display: none !important; }", "")

with open("assets/css/global.css", "w", encoding="utf-8") as f:
    f.write(css_content + "\n" + css_patch)

print("Fixed layout!")
