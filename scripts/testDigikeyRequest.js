import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';

dotenv.config();
puppeteer.use(StealthPlugin());

const BASE_URL = 'https://www.digikeycomputer.com';
const SEARCH_TERM = 'bilgisayar';

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // 🔍 Tüm gelen yanıtları izle
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('ajax.aspx?t=listProperties')) {
      console.log('🛰 XHR geldi:', url);
      try {
        const json = await res.json();
        console.log('📦 Ürün sayısı:', json?.list?.length ?? 0);
        console.dir(json?.list?.slice(0, 3), { depth: null });
      } catch (err) {
        console.error('❌ JSON parse hatası:', err.message);
      }
    }
  });

  const url = `${BASE_URL}/arama/?src=${encodeURIComponent(SEARCH_TERM)}`;
  console.log('🔍 Gidilen sayfa:', url);

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(resolve => setTimeout(resolve, 5000));

  await browser.close();
}

main();
