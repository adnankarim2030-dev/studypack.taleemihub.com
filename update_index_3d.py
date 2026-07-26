import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

start = html.find('<div class="bento reveal">')
end = html.find('</section>', start)

bento_html = html[start:end]

def replace_card(m):
    card_open = m.group(1)
    card_inner = m.group(2)
    
    if 'card-content' in card_inner:
        return m.group(0)
    
    new_inner = f'''
        <div class="card-border"></div>
        <div class="card-glare"></div>
        <div class="card-content">
            {card_inner.strip()}
            <div class="card-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
        </div>
    '''
    return f'{card_open}{new_inner}</a>'

new_bento = re.sub(r'(<a[^>]+class="[^"]*cat-card[^"]*"[^>]*>)(.*?)(</a>)', replace_card, bento_html, flags=re.DOTALL)

html = html[:start] + new_bento + html[end:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Updated index.html HTML structure for 3D cards')
