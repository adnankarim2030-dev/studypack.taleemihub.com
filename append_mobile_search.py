import os

mobile_css = """
/* ================= MOBILE SEARCH BAR FIX ================= */
@media (max-width: 900px) {
  /* Unhide the search bar on mobile */
  .nav-search-bar {
    display: flex !important;
    order: 3;
    width: 100% !important;
    max-width: 100% !important;
    margin-top: 12px !important;
  }
  
  /* Change navbar from pill to rounded box on mobile to fit the search bar cleanly */
  header.nav .navbar {
    flex-wrap: wrap !important;
    border-radius: 20px !important;
    padding: 14px 20px !important;
    gap: 0 !important;
  }
  
  /* Keep the logo and icons on the top row */
  .logo { order: 1; margin-right: auto; }
  .nav-actions { order: 2; }
  
  /* Make sure dropdown stays within screen width */
  .ai-search-dropdown {
    width: 100% !important;
    left: 0 !important;
    right: 0 !important;
  }
}
"""

with open('assets/css/global.css', 'a', encoding='utf-8') as f:
    f.write(mobile_css)

print("Injected mobile search bar CSS")
