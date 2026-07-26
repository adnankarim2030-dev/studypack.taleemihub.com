import re

filepath = 'f:/studypack.taleemihub.com/files (2)/checkout.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix checkout margin-left:36px inline styles
content = content.replace('style="margin-left:36px;"', 'class="co-indented"')
content = content.replace('style="margin-left:36px; margin-top:18px; display:none;"', 'class="co-indented" style="margin-top:18px; display:none;"')

# 2. Fix Upsell Modal padding and flex row for mobile
# Padding from 40px to 'clamp(20px, 5vw, 40px)'
content = content.replace('padding: 40px;', 'padding: clamp(20px, 5vw, 40px);')

# Scene 3D width from 300px to 100%, max-width 300px
content = content.replace('width: 300px; height: 300px;', 'width: 100%; max-width: 300px; height: clamp(200px, 60vw, 300px);')

# Flex buttons in upsell from display: flex to flex-wrap
content = content.replace('style="display: flex; gap: 16px; justify-content: center; width: 100%;"', 'style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; width: 100%;"')

# Update titles and buttons width if necessary, but flex-wrap handles buttons.
# Font size of h2 from 32px to clamp(24px, 6vw, 32px)
content = content.replace('font-size: 32px;', 'font-size: clamp(24px, 6vw, 32px);')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("checkout.html responsiveness fixes applied.")
