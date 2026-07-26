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

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.mybagpack.com/collection/class-playgroup-te', { waitUntil: 'networkidle2' });
  
  const pricesMap = await page.evaluate(async (slugs) => {
      let map = {};
      for (const slug of slugs) {
          try {
              let res = await fetch(`https://storefront-apis.infra.myfishry.com/products?storeId=my-bag-pack&slug=${slug}&limit=200`);
              let json = await res.json();
              if (json && json.data) {
                  for (let p of json.data) {
                      if (p.productName) {
                          let price = 0;
                          if (p.productVarients && p.productVarients.length > 0) {
                              price = p.productVarients[0].price;
                          } else if (p.hasVarients && p.variants && p.variants.length > 0) {
                              price = p.variants[0].price;
                          } else if (p.productPrice) {
                              price = p.productPrice;
                          } else if (p.price) {
                              price = p.price;
                          }
                          map[p.productName] = price;
                      }
                  }
              }
          } catch(e) { }
      }
      return map;
  }, collections);
  
  fs.writeFileSync('prices_map.json', JSON.stringify(pricesMap, null, 2));
  console.log("Prices extracted:", Object.keys(pricesMap).length);
  await browser.close();
})();
