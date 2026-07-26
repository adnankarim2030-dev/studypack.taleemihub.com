const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('storefront-apis.infra.myfishry.com/products') || url.includes('fishry')) {
      try {
        const text = await response.text();
        const json = JSON.parse(text);
        if (json.data && Array.isArray(json.data) && json.data.length > 0 && json.data[0].productName) {
            fs.writeFileSync('sample_product.json', JSON.stringify(json.data[0], null, 2));
            console.log("Dumped sample product");
            process.exit(0);
        }
      } catch (e) { }
    }
  });
  
  await page.goto('https://www.mybagpack.com/collection/class-playgroup-te', { waitUntil: 'networkidle0', timeout: 15000 });
  await browser.close();
})();
