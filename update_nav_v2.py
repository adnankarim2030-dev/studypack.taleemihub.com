import os
import glob
import re

css_code = """
/* ============ PREMIUM 3D GLASSMORPHISM MOBILE NAV ============ */
.bottom-dock {
  position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  width: 90%; max-width: 360px; height: 68px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 100px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.6);
  display: flex; align-items: center; justify-content: space-between; padding: 0 24px;
  z-index: 2001; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.dock-item {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  color: var(--muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  transition: 0.3s; position: relative;
}
.dock-item svg { width: 22px; height: 22px; transition: 0.3s; }
.dock-item.active { color: var(--blue); }
.dock-item.active svg { transform: translateY(-2px); }

/* Central Orb */
.dock-orb-wrap {
  position: relative; top: -16px;
}
.dock-orb {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, var(--blue), var(--orange));
  box-shadow: 0 14px 28px rgba(255, 111, 0, 0.3), inset 0 4px 10px rgba(255, 255, 255, 0.4), inset 0 -4px 10px rgba(0, 0, 0, 0.2);
  display: flex; align-items: center; justify-content: center;
  color: #fff; cursor: pointer; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative; overflow: hidden;
}
.dock-orb svg { width: 26px; height: 26px; transition: 0.4s; z-index: 2; }
.dock-orb:hover, .dock-orb:active { transform: scale(1.08); box-shadow: 0 18px 36px rgba(255, 111, 0, 0.4), inset 0 4px 10px rgba(255, 255, 255, 0.5); }

/* Liquid Ripple */
.ripple {
  position: absolute; border-radius: 50%; transform: scale(0);
  background: rgba(255, 255, 255, 0.4);
  animation: ripple-anim 0.6s linear; pointer-events: none;
}
@keyframes ripple-anim {
  to { transform: scale(4); opacity: 0; }
}

/* Glass Menu Overlay */
.glass-menu-overlay {
  position: fixed; inset: 0; width: 100%; height: 100vh;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(28px) saturate(200%); -webkit-backdrop-filter: blur(28px) saturate(200%);
  z-index: 2000; opacity: 0; visibility: hidden; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex; flex-direction: column; justify-content: center; padding: 40px;
}
.glass-menu-overlay.open { opacity: 1; visibility: visible; }
.glass-menu-overlay::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 10% 20%, rgba(21,101,192,0.1), transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(255,193,7,0.15), transparent 45%);
}

.gm-links {
  display: flex; flex-direction: column; gap: 16px; position: relative; z-index: 1;
}

.gm-link {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; border-radius: 20px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(255, 255, 255, 1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: var(--navy); font-size: 17px; font-weight: 700; font-family: var(--ff-head);
  transform: translateY(30px); opacity: 0; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden; position: relative;
}
.glass-menu-overlay.open .gm-link { transform: translateY(0); opacity: 1; }
/* Staggering delays */
.gm-link:nth-child(1) { transition-delay: 0.05s; }
.gm-link:nth-child(2) { transition-delay: 0.1s; }
.gm-link:nth-child(3) { transition-delay: 0.15s; }
.gm-link:nth-child(4) { transition-delay: 0.2s; }
.gm-link:nth-child(5) { transition-delay: 0.25s; }
.gm-link:nth-child(6) { transition-delay: 0.3s; }

.gm-link .gm-text { position: relative; z-index: 2; }
.gm-link svg { width: 20px; height: 20px; color: var(--orange); position: relative; z-index: 2; opacity: 0.7; transition: 0.3s; }
.gm-link:hover, .gm-link:active {
  box-shadow: 0 12px 30px rgba(21, 101, 192, 0.15), inset 0 1px 2px rgba(255, 255, 255, 1);
  transform: scale(1.02); color: var(--blue);
}
.gm-link:hover svg { opacity: 1; transform: translateX(3px); }

/* Hide Desktop Header Burger */
@media (max-width: 760px) {
  header.nav .burger { display: none !important; }
}
@media (min-width: 761px) {
  .bottom-dock { display: none !important; }
}
"""

js_code = """
<!-- Mobile Nav JS -->
<script>
document.addEventListener("DOMContentLoaded", function() {
  const dockOrb = document.getElementById("dockOrb");
  const glassMenu = document.getElementById("glassMenu");
  const orbIcon = dockOrb.querySelector("svg");
  let menuOpen = false;

  dockOrb.addEventListener("click", function(e) {
    createRipple(e, dockOrb);
    menuOpen = !menuOpen;
    if(menuOpen) {
      glassMenu.classList.add("open");
      orbIcon.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
      dockOrb.style.background = 'linear-gradient(135deg, var(--ink), var(--navy))';
    } else {
      glassMenu.classList.remove("open");
      orbIcon.innerHTML = '<path d="M3 12h18M3 6h18M3 18h18"/>';
      dockOrb.style.background = 'linear-gradient(135deg, var(--blue), var(--orange))';
    }
  });

  const gmLinks = document.querySelectorAll(".gm-link");
  gmLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      createRipple(e, link);
      // Let ripple show before navigation if possible
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
</script>
"""

html_nav = """
<!-- Premium Bottom Dock & Glass Menu -->
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

<div class="bottom-dock">
  <a href="index.html" class="dock-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    Home
  </a>
  <a href="books.html" class="dock-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    Shop
  </a>
  <div class="dock-orb-wrap">
    <div class="dock-orb" id="dockOrb">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
    </div>
  </div>
  <a href="javascript:void(0)" onclick="document.getElementById('cartDrawer').classList.add('show'); document.getElementById('cartOverlay').classList.add('show');" class="dock-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
    Cart
  </a>
  <a href="#" class="dock-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    Profile
  </a>
</div>
"""

# Append CSS to global.css
with open("assets/css/global.css", "a", encoding="utf-8") as f:
    f.write("\\n" + css_code + "\\n")

# Process all html files
for file in glob.glob("*.html"):
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove old mobile nav
    content = re.sub(r'<!-- Mobile Nav -->.*?</div>\s*<div id="preloader">', '<div id="preloader">', content, flags=re.DOTALL)
    
    # Inject new nav right after <body>
    content = re.sub(r'(<body[^>]*>)', r'\\1\n' + html_nav, content)
    
    # Inject JS right before </body>
    if js_code not in content:
        content = content.replace("</body>", js_code + "\n</body>")
        
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

print("Applied 3D glassmorphism mobile nav to all HTML files and updated global.css.")
