import glob
import re

new_js = """<!-- Mobile Nav JS -->
<script>
document.addEventListener("DOMContentLoaded", function() {
  const topBurger = document.getElementById("topBurger");
  const glassMenu = document.getElementById("glassMenu");
  const glassCloseBtn = document.getElementById("glassCloseBtn");
  
  if(topBurger && glassMenu) {
    const burgerIcon = topBurger.querySelector("svg");
    let menuOpen = false;

    function closeMenu() {
      menuOpen = false;
      glassMenu.classList.remove("open");
      burgerIcon.innerHTML = '<path d="M3 12h18M3 6h18M3 18h18"/>';
    }

    function openMenu() {
      menuOpen = true;
      glassMenu.classList.add("open");
      burgerIcon.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
    }

    topBurger.addEventListener("click", function(e) {
      createRipple(e, topBurger);
      if(menuOpen) closeMenu();
      else openMenu();
    });

    if(glassCloseBtn) {
      glassCloseBtn.addEventListener("click", function(e) {
        createRipple(e, glassCloseBtn);
        closeMenu();
      });
    }
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

for file in glob.glob("*.html"):
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace old JS block
    content = re.sub(r'<!-- Mobile Nav JS -->\s*<script>.*?</script>', new_js, content, flags=re.DOTALL)

    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

print("Fixed JS scope error for close button.")
