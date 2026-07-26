import re

filepath = 'f:/studypack.taleemihub.com/files (2)/assets/js/main.js'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Delete everything after id: 50000. Wait, no. The objects have id >= 50000.
# The structure is:
#   {
#     id: 50000,
#     ...
#   },
# Let's just use regex to remove any object with id >= 50000.
new_text = re.sub(r'\s*\{\s*id:\s*5\d{4},.*?(?=\n\s*\{|\n\];)', '', text, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_text)
    
print("Cleaned up >= 50000")
