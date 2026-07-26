const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://studypack-taleemihub.vercel.app/books.html', { waitUntil: 'networkidle2' });
  
  // take a screenshot
  await page.screenshot({ path: 'debug_screenshot.png' });
  
  // Dump some DOM stats
  const gridCount = await page.evaluate(() => {
    const grid = document.getElementById('productGrid');
    return grid ? grid.children.length : -1;
  });
  console.log("productGrid children:", gridCount);
  
  const display = await page.evaluate(() => {
    const grid = document.getElementById('productGrid');
    return grid ? window.getComputedStyle(grid).display : null;
  });
  console.log("productGrid display:", display);
  
  const opacity = await page.evaluate(() => {
    const grid = document.getElementById('productGrid');
    return grid ? window.getComputedStyle(grid).opacity : null;
  });
  console.log("productGrid opacity:", opacity);
  
  await browser.close();
})();
