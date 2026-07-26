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

let productsMap = {};

function getRegion(slug) {
    if (slug.endsWith('-tesr')) return 'Sindh Region';
    if (slug.endsWith('-te-ict')) return 'ICT Region';
    if (slug.endsWith('-te-kpk')) return 'KPK Region';
    if (slug.endsWith('-tesp')) return 'South Punjab Region';
    return 'Punjab Region';
}

function getClassStr(slug) {
    const match = slug.match(/class-([a-z0-9]+)-/);
    if (match) {
        let c = match[1];
        if (c === 'playgroup') return 'Playgroup';
        if (c === 'nursery') return 'Nursery';
        if (c === 'kg') return 'KG';
        return 'Class ' + c;
    }
    return 'Unknown';
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let currentSlug = '';
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('storefront-apis.infra.myfishry.com/products') || url.includes('fishry')) {
      try {
        const text = await response.text();
        const json = JSON.parse(text);
        if (json.data && Array.isArray(json.data)) {
            let region = getRegion(currentSlug);
            let clsStr = getClassStr(currentSlug);
            
            for (const p of json.data) {
                if (!productsMap[p.id]) {
                    productsMap[p.id] = {
                        title: p.productName,
                        price: p.hasVariants && p.variants ? p.variants[0].price : p.price || 0,
                        img: (p.productImage && p.productImage.length > 0) ? 'https://cdn.fishry.com/product/' + p.productImage[0].Image : '',
                        type: p.productTypeName,
                        regions: new Set(),
                        classes: new Set()
                    };
                }
                productsMap[p.id].regions.add(region);
                productsMap[p.id].classes.add(clsStr);
            }
        }
      } catch (e) { }
    }
  });
  
  for (const coll of collections) {
      currentSlug = coll;
      const url = `https://www.mybagpack.com/collection/${coll}`;
      console.log("Fetching", coll);
      try {
          await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
      } catch(e) {
          console.log("Timeout for", coll);
      }
  }
  
  // Convert Sets to Arrays
  let finalProducts = Object.values(productsMap).map(p => ({
      ...p,
      regions: Array.from(p.regions),
      classes: Array.from(p.classes)
  }));
  
  fs.writeFileSync('educators_products_mapped.json', JSON.stringify(finalProducts, null, 2));
  await browser.close();
  console.log("Total unique products scraped:", finalProducts.length);
})();
