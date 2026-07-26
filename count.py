import re

with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

count = len(re.findall(r'"id":', content))
print(f"Total books scraped in main.js: {count}")

with open(r'C:\Users\Desktop\.gemini\antigravity\brain\b88887e5-4ba6-4ca7-9ebc-dd614d5eb5e2\.system_generated\steps\23\content.md', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's try to extract "Showing 1-20 of X results"
import re
match = re.search(r'Showing (\d+).+?(\d+) results', html, re.IGNORECASE)
if match:
    print(f"Live website total results: {match.group(2)}")
else:
    match2 = re.search(r'Showing all (\d+) results', html, re.IGNORECASE)
    if match2:
         print(f"Live website total results: {match2.group(1)}")
    else:
         print("Could not find total results in live HTML.")
