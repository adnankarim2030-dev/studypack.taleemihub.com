import re

with open('assets/css/global.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Change header background back to dark blue and text to white
css = css.replace('background:rgba(227, 242, 253, 0.95);', 'background:rgba(15, 23, 42, 0.85);')
css = css.replace('background:rgba(210, 235, 255, 0.95);', 'background:rgba(15, 23, 42, 0.95);')

# Restore logo text color
css = css.replace('.logo{display:flex; align-items:center; gap:8px; font-family:var(--ff-head); font-weight:800; font-size:19px; color:var(--navy); flex-shrink:0;}', '.logo{display:flex; align-items:center; gap:8px; font-family:var(--ff-head); font-weight:800; font-size:19px; color:#fff; flex-shrink:0;}')

# Restore nav links color
css = css.replace('.nav-links a{font-size:14.5px; font-weight:600; color:var(--navy); padding:10px 18px; border-radius:100px; transition:all .3s ease;}', '.nav-links a{font-size:14.5px; font-weight:600; color:#e2e8f0; padding:10px 18px; border-radius:100px; transition:all .3s ease;}')
css = css.replace('.nav-links a:hover{background:rgba(0,0,0,0.05); color:var(--blue); transform:translateY(-1px);}', '.nav-links a:hover{background:rgba(255,255,255,0.1); color:#fff; transform:translateY(-1px);}')

# Restore icon buttons
css = css.replace('.icon-btn{position:relative; width:42px; height:42px; display:flex; align-items:center; justify-content:center; border-radius:50%; color:var(--navy); transition:.3s ease;}', '.icon-btn{position:relative; width:42px; height:42px; display:flex; align-items:center; justify-content:center; border-radius:50%; color:#fff; transition:.3s ease;}')
css = css.replace('.icon-btn:hover{background:rgba(0,0,0,0.05); transform:translateY(-2px);}', '.icon-btn:hover{background:rgba(255,255,255,0.1); transform:translateY(-2px);}')

# Restore burger icon
css = css.replace('.burger{display:none; width:42px; height:42px; align-items:center; justify-content:center; border-radius:50%; color:var(--navy);}', '.burger{display:none; width:42px; height:42px; align-items:center; justify-content:center; border-radius:50%; color:#fff;}')

with open('assets/css/global.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('Reverted navbar colors to dark mode in global.css')
