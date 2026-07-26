import glob
import re

css_patch = """
/* AI Search Bar UI */
.nav-search-bar {
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}
.nav-search-bar.expanded {
  background: rgba(255,255,255,1);
  border-color: rgba(25, 118, 210, 0.4);
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1), 0 10px 30px rgba(0,0,0,0.1);
  border-radius: 12px 12px 0 0;
}

.ai-search-dropdown {
  position: absolute;
  top: 100%; left: -1px; right: -1px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(25, 118, 210, 0.4);
  border-top: none;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  opacity: 0; visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  max-height: 450px; overflow-y: auto;
}
.ai-search-dropdown.show {
  opacity: 1; visibility: visible; transform: translateY(0);
}

.search-result-item {
  display: flex; gap: 12px; padding: 12px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  text-decoration: none; transition: 0.2s;
}
.search-result-item:hover {
  background: rgba(25, 118, 210, 0.05);
}
.sr-thumb {
  width: 48px; height: 64px; flex-shrink: 0;
  border-radius: 4px; overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.sr-thumb img { width: 100%; height: 100%; object-fit: cover; }
.sr-info { display: flex; flex-direction: column; justify-content: center; flex: 1; }
.sr-title { margin: 0 0 4px 0; font-size: 14px; color: var(--navy); font-weight: 600; line-height: 1.3; }
.sr-title mark { background: rgba(25, 118, 210, 0.15); color: var(--blue); padding: 0 2px; border-radius: 2px; }
.sr-meta { font-size: 11px; color: #666; margin-bottom: 6px; }
.sr-bot { display: flex; align-items: center; justify-content: space-between; }
.sr-price { font-size: 13px; font-weight: 700; color: var(--orange); }
.sr-stock { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 8px; text-transform: uppercase; }
.sr-stock.in-stock { background: #e8f5e9; color: #2e7d32; }
.sr-stock.out-stock { background: #ffebee; color: #c62828; }

.no-results { padding: 32px 20px; text-align: center; color: #666; }
.no-results svg { width: 32px; height: 32px; margin-bottom: 12px; opacity: 0.5; }
.no-results p { margin: 0 0 4px 0; font-size: 15px; color: var(--navy); }
.no-results span { font-size: 12px; }

.sr-view-all {
  display: block; text-align: center; padding: 12px;
  background: #f8f9fa; color: var(--blue);
  font-size: 13px; font-weight: 600; text-decoration: none;
  transition: 0.2s;
}
.sr-view-all:hover { background: #eef2f6; }
"""

with open("assets/css/global.css", "a", encoding="utf-8") as f:
    f.write("\\n" + css_patch + "\\n")

for file in glob.glob("*.html"):
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # Inject scripts before </body> if not present
    if "search_data.js" not in content:
        scripts_to_add = '<script src="assets/js/search_data.js"></script>\\n<script src="assets/js/search_logic.js"></script>\\n</body>'
        content = content.replace("</body>", scripts_to_add)
        
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)

print("Injected AI Search logic and CSS.")
