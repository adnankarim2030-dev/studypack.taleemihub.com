const jsdom = require("jsdom");
const { JSDOM } = jsdom;

JSDOM.fromURL("https://studypack-taleemihub.vercel.app/books.html", {
  runScripts: "dangerously",
  resources: "usable"
}).then(dom => {
  const virtualConsole = dom.window._virtualConsole || new jsdom.VirtualConsole();
  virtualConsole.on("error", (err) => { console.error("Browser Error:", err); });
  virtualConsole.on("jsdomError", (err) => { console.error("JSDOM Error:", err); });
  
  setTimeout(() => {
    const grid = dom.window.document.getElementById('productGrid');
    if (grid) {
      console.log("productGrid child nodes count:", grid.childNodes.length);
      console.log("InnerHTML sample:", grid.innerHTML.substring(0, 500));
      console.log("Current page:", dom.window.currentPage);
      console.log("currentBooks length:", dom.window.currentBooks ? dom.window.currentBooks.length : 'undefined');
      console.log("resultCount:", dom.window.document.getElementById('resultCount').textContent);
    } else {
      console.log("productGrid not found!");
    }
  }, 5000);
}).catch(e => {
  console.error("Fetch error:", e);
});
