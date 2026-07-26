import glob
import re

search_html = """
  <div class="gm-search-wrapper" style="margin-bottom: 24px; animation: slideDown 0.4s ease forwards;">
    <form class="gm-search" onsubmit="event.preventDefault(); const q = this.querySelector('input').value.trim(); if(q) window.location.href='books.html?q='+encodeURIComponent(q); else window.location.href='books.html';" style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.5); border-radius: 16px; padding: 10px 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.06), inset 0 1px 2px rgba(255,255,255,1);">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; color: var(--muted);"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="text" placeholder="Search store..." style="flex: 1; border: none; outline: none; background: transparent; font-size: 15px; color: var(--ink); font-family: var(--ff-body);">
      <button type="submit" style="background: var(--grad-brand); color: #fff; font-weight: 700; font-size: 13px; padding: 8px 14px; border-radius: 10px; transition: 0.3s; box-shadow: 0 4px 10px rgba(255,111,0,0.3);">Search</button>
    </form>
  </div>
"""

for file in glob.glob("*.html"):
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # Avoid adding multiple times
    if "gm-search-wrapper" not in content:
        # Insert search_html right after <div class="gm-links">
        content = content.replace('<div class="gm-links">', '<div class="gm-links">\n' + search_html)
        
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)

print("Search bar added to mobile glass menu.")
