const puppeteer = require('puppeteer');
const fs = require('fs');

const collections = [
  "class-playgroup-te", "class-nursery-te", "class-kg-te", "class-1-te", "class-2-te",
  "class-3-te", "class-4-te", "class-5-te", "class-6-te", "class-7-te", "class-8-te",
  "class-playgroup-tesr", "class-nursery-tesr", "class-kg-tesr", "class-1-tesr",
  "class-2-tesr", "class-3-tesr", "class-4-tesr", "class-5-tesr", "class-6-tesr",
  "class-7-tesr", "class-8-tesr", "class-playgroup-te-ict", "class-nursery-te-ict",
  "class-kg-te-ict", "class-1-te-ict", "class-2-te-ict", "class-3-te-ict", "class-4-te-ict",
  "class-5-te-ict", "class-6-te-ict", "class-7-te-ict", "class-8-te-ict",
  "class-playgroup-te-kpk", "class-nursery-te-kpk", "class-kg-te-kpk", "class-1-te-kpk",
  "class-2-te-kpk", "class-3-te-kpk", "class-4-te-kpk", "class-5-te-kpk", "class-6-te-kpk",
  "class-7-te-kpk", "class-8-te-kpk", "class-playgroup-tesp", "class-nursery-tesp",
  "class-kg-tesp", "class-1-tesp", "class-2-tesp", "class-3-tesp", "class-4-tesp",
  "class-5-tesp", "class-6-tesp", "class-7-tesp", "class-8-tesp"
];

let pricesMap = {};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('storefront-apis.infra.myfishry.com/products') || url.includes('fishry')) {
      try {
        const text = await response.text();
        const json = JSON.parse(text);
        if (json.data && Array.isArray(json.data)) {
            for (const p of json.data) {
                if (p.productName) {
                    let price = p.productPrice || p.price || 0;
                    if (p.productVarients && p.productVarients.length > 0) price = p.productVarients[0].price || price;
                    if (p.hasVarients && p.variants && p.variants.length > 0) price = p.variants[0].price || price;
                    pricesMap[p.productName] = price;
                }
            }
        }
      } catch (e) { }
    }
  });
  
  for (const coll of collections) {
      const url = `https://www.mybagpack.com/collection/${coll}`;
      try {
          await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
      } catch(e) {
          console.log("Timeout on", coll);
      }
      console.log("Fetched", coll, "Keys:", Object.keys(pricesMap).length);
  }
  
  fs.writeFileSync('prices_map.json', JSON.stringify(pricesMap, null, 2));
  console.log("Total prices extracted:", Object.keys(pricesMap).length);
  await browser.close();
})();
