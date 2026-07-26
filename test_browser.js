const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

try {
  const html = fs.readFileSync('books.html', 'utf8');
  
  const virtualConsole = new jsdom.VirtualConsole();
  virtualConsole.on("error", (err) => { console.error("Browser Error:", err); });

  const dom = new JSDOM(html, { 
    runScripts: "dangerously",
    resources: "usable",
    virtualConsole
  });

  setTimeout(() => {
    const doc = dom.window.document;
    const grid = doc.getElementById('productGrid');
    if (grid) {
      console.log("productGrid child nodes count:", grid.childNodes.length);
      console.log("InnerHTML sample:", grid.innerHTML.substring(0, 200));
      console.log("Current page:", dom.window.currentPage);
      console.log("currentBooks length:", dom.window.currentBooks ? dom.window.currentBooks.length : 'undefined');
    }
  }, 2000);
} catch(e) {
  console.error("Exception:", e);
}
