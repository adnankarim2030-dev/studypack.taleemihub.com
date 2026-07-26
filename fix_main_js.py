import re

filepath = 'f:/studypack.taleemihub.com/files (2)/assets/js/main.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Waqfiyat Aama that got marked as computer due to 'it' in Amli Kitab
# We can just change their subj to 'The Educators Science' (since Waqfiyat Aama is general knowledge / science)
def replacer(match):
    # match.group(1) is the part before subj:
    # match.group(2) is the part after
    return match.group(1) + '"The Educators Science"' + match.group(2)

# Using regex to find all book objects where title has Waqfiyat and subj is The Educators Computer
# Better yet, let's just do a blanket fix for ANY book where the title doesn't actually have "computer" or "it" as a word.
# To be safe, just fix Waqfiyat explicitly:
new_content = re.sub(r'(title:\s*"[^"]*Waqfiyat[^"]*",.*?subj:\s*)"The Educators Computer"', r'\1"The Educators Science"', content, flags=re.IGNORECASE | re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Fixed Waqfiyat subjects in main.js")
