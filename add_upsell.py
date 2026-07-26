import re

filepath = 'f:/studypack.taleemihub.com/files (2)/checkout.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

upsell_html = """
<!-- ================= UPSELL MODAL ================= -->
<div class="modal-overlay" id="upsellOverlay">
  <div class="qv-modal" style="display:flex; flex-direction:column; align-items:center; text-align:center; padding: 40px; background: linear-gradient(135deg, #fcecd7, #dbeafe);">
    <button class="modal-close" onclick="document.getElementById('upsellOverlay').classList.remove('show')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    <h2 style="font-size: 32px; color: var(--navy); margin-bottom: 10px;">Before You Go!</h2>
    <p style="color: var(--muted); font-size: 16px; margin-bottom: 30px; max-width: 400px;">Get more items to complete your Study Pack! Grab some cool toys and stationery.</p>
    
    <div class="scene-3d" style="margin: 0 auto; margin-bottom: 40px; width: 300px; height: 300px; display: flex; align-items: center; justify-content: center; perspective: 1200px;">
      <!-- JS will inject carousel here -->
    </div>
    
    <div style="display: flex; gap: 16px; justify-content: center; width: 100%;">
      <a href="toys.html" class="btn-primary" style="background:var(--grad-brand); color:#fff; padding: 12px 24px; text-decoration:none;">Shop Toys</a>
      <a href="stationery.html" class="btn-primary" style="background:var(--navy); color:#fff; padding: 12px 24px; text-decoration:none;">Shop Stationery</a>
    </div>
  </div>
</div>
"""

upsell_script = """
<script>
  document.addEventListener('DOMContentLoaded', function() {
    let extraItems = [];
    if (typeof TOYS !== 'undefined') extraItems = extraItems.concat(TOYS);
    if (typeof STATIONERY !== 'undefined') extraItems = extraItems.concat(STATIONERY);
    
    if (extraItems.length > 0 && typeof init3DCarousel === 'function') {
      init3DCarousel(extraItems);
    }
    
    setTimeout(() => {
      const upsell = document.getElementById('upsellOverlay');
      if(upsell) upsell.classList.add('show');
    }, 1000);
  });
</script>
</body>
"""

# Insert the HTML before <div class="toast"
content = content.replace('<div class="toast"', upsell_html + '\n<div class="toast"')

# Insert the script before </body>
content = content.replace('</body>', upsell_script)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added upsell modal to checkout.html")
