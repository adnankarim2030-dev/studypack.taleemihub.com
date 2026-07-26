import glob

profile_icon = """<a href="#" class="icon-btn" aria-label="Profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </a>"""

for file in glob.glob("*.html"):
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove the profile icon
    if profile_icon in content:
        content = content.replace(profile_icon, "")
        
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)

print("Profile icon removed from all HTML files.")
