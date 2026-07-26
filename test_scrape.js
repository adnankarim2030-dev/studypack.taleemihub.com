const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('catalog/products') || url.includes('fishry')) {
      try {
        const text = await response.text();
        console.log('API URL:', url);
        if (text.length > 500) {
            console.log('Response excerpt:', text.substring(0, 500));
        } else {
            console.log('Response:', text);
        }
      } catch (e) { }
    }
  });
  
  const url = 'https://www.mybagpack.com/collection/class-playgroup-te';
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
