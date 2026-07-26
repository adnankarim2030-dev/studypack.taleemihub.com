import re

with open('book-details.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace search_data.js with main.js
content = content.replace('<script src="assets/js/search_data.js"></script>', '<script src="assets/js/main.js"></script>')

# Update the JS logic to use BOOKS instead of bookDatabase
content = content.replace('typeof bookDatabase !== \\'undefined\\'', 'typeof BOOKS !== \\'undefined\\'')
content = content.replace('bookDatabase.find(b => b.id === bookId)', 'BOOKS.find(b => String(b.id) === String(bookId))')

# Update rendering to use real fields from BOOKS
new_rendering = """if(book) {
        document.title = book.title + " — Study Pack";
        document.getElementById("bdTitle").innerText = book.title;
        document.getElementById("bdAuthor").innerText = book.author || 'Study Pack';
        document.getElementById("bdPublisher").innerText = book.pub || 'General';
        document.getElementById("bdPrice").innerText = "Rs " + (book.price || 0);
        document.getElementById("bdOldPrice").innerText = book.old ? "Rs " + book.old : '';
        document.getElementById("bdIsbn").innerText = book.isbn || ('978-969-' + book.id + '23-01-' + book.id);
        document.getElementById("bdClass").innerText = book.cls || 'Misc';
        document.getElementById("bdSubject").innerText = book.subj || 'General';
        
        const imgSrc = book.img || 'https://via.placeholder.com/400x600/eee/999?text=' + encodeURIComponent(book.title);
        document.getElementById("mainCover").src = imgSrc;
        
        const activeThumb = document.querySelector(".bd-thumb.active img");
        if(activeThumb) activeThumb.src = imgSrc;
      }"""

content = re.sub(r'if\(book\) \{.*?\n      \}', new_rendering, content, flags=re.DOTALL)

with open('book-details.html', 'w', encoding='utf-8') as f:
    f.write(content)
