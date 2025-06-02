import puppeteer from 'puppeteer';
import fs from 'fs';

const url = 'https://www.digikeycomputer.com/arama/?src=bilgisayar&page=1';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  const html = await page.content();

  fs.writeFileSync('digikey-page.html', html); // 🔥 Çıktıyı dosyaya kaydet

  console.log('✅ HTML başarıyla "digikey-page.html" dosyasına yazıldı.');

  await browser.close();
})();
