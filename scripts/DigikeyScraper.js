import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import Business from '../src/models/Business.js';

dotenv.config();
puppeteer.use(StealthPlugin());

const BASE_URL = 'https://www.digikeycomputer.com';
const SEARCH_TERMS = [
  'bilgisayar',
  'ag-urunleri',
  'bilgisayar-parcalari',
  'cevre-bilimleri',
  'depolama-ürünleri',
  'oyuncu-ekipmanlari',
  'telefon',
  'tuketici-elektronigi'
];

function parsePrice(text) {
  try {
    return parseFloat(text.replace('.', '').replace(',', '.').replace('TL', '').replace('₺', '').trim());
  } catch {
    return null;
  }
}

async function scrapeXHRProducts(term, browser, businessId) {
  const page = await browser.newPage();
  const results = [];

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const type = req.resourceType();
    if (type === 'image' || type === 'stylesheet' || type === 'font') {
      req.abort();
    } else {
      req.continue();
    }
  });

  const productList = [];

  const handler = async (response) => {
    const url = response.url();
    if (url.includes('ajax.aspx?t=listProperties')) {
      try {
        const json = await response.json();
        if (!json?.list?.length) return;

        for (const item of json.list) {
          const name = item.name?.trim();
          const productUrl = BASE_URL + item.url;
          const image = BASE_URL + item.image;
          const price = parsePrice(item.price);

          if (!name || !productUrl || !price) continue;

          await Product.findOneAndUpdate(
            { productUrl },
            {
              name,
              price,
              image,
              productUrl,
              businessName: 'Digikey Computer',
              business: businessId,
              $addToSet: { categories: term },
              $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true }
          );

          productList.push(name);
        }
      } catch (e) {
        console.warn('❌ JSON parse error:', e.message);
      }
    }
  };

  page.on('response', handler);

  const url = `${BASE_URL}/arama/?src=${encodeURIComponent(term)}`;
  console.log(`🔍 Yükleniyor: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

  // ✅ Bekleme alternatifi
  await new Promise(resolve => setTimeout(resolve, 6000));

  page.off('response', handler);
  await page.close();

  return productList.length;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('📡 MongoDB bağlantısı kuruldu');

  const businessName = 'Digikey Computer';
  const location = { type: 'Point', coordinates: [33.9187, 35.1549] };

  let business = await Business.findOne({ name: businessName });
  if (!business) {
    business = await Business.create({ name: businessName, website: BASE_URL, location });
    console.log('🏪 İşletme oluşturuldu');
  }

  const browser = await puppeteer.launch({ headless: false });
  let total = 0;

  for (const term of SEARCH_TERMS) {
    const count = await scrapeXHRProducts(term, browser, business._id);
    console.log(`✅ ${count} ürün işlendi (${term})`);
    total += count;
  }

  await browser.close();
  console.log(`🎉 Toplam ${total} ürün MongoDB’ye işlendi.`);
  process.exit();
}

main().catch((err) => {
  console.error('❌ Scraper error:', err);
  process.exit(1);
});

