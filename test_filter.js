const fs = require('fs');
try {
  let mainJs = fs.readFileSync('assets/js/main.js', 'utf8');
  mainJs = mainJs.replace(/const BOOKS/g, 'var BOOKS');
  eval(mainJs);

  let badBooks = BOOKS.filter(b => typeof b.title !== 'string' || typeof b.cls !== 'string' || typeof b.subj !== 'string');
  console.log("Books with non-string fields:", badBooks.length);
  if (badBooks.length > 0) {
    console.log(badBooks[0]);
  }
} catch(e) {
  console.error("Error:", e);
}
