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

let allProducts = [];
let seen = new Set();

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
                if (!seen.has(p.id)) {
                    seen.add(p.id);
                    allProducts.push({
                        title: p.productName,
                        price: p.hasVariants && p.variants ? p.variants[0].price : p.price || 0, // we will try to get price
                        price2: p.variants ? p.variants[0].price : null,
                        img: (p.productImage && p.productImage.length > 0) ? 'https://cdn.fishry.com/product/' + p.productImage[0].Image : '',
                        type: p.productTypeName
                    });
                }
            }
        }
      } catch (e) { }
    }
  });
  
  for (const coll of collections) {
      const url = `https://www.mybagpack.com/collection/${coll}`;
      console.log("Fetching", coll);
      try {
          await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
      } catch(e) {
          console.log("Timeout for", coll);
      }
  }
  
  fs.writeFileSync('educators_products.json', JSON.stringify(allProducts, null, 2));
  await browser.close();
  console.log("Total unique products scraped:", allProducts.length);
})();
