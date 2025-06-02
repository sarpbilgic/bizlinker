import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import Business from '../src/models/Business.js';

dotenv.config();

const BASE_URL = 'https://www.digikeycomputer.com';
const SEARCH_QUERIES = [
  'bilgisayar',
  'ag-urunleri',
  'bilgisayar-parcalari',
  'cevre-bilimleri',
  'depolama-ürünleri',
  'oyuncu-ekipmanlari',
  'telefon',
  'tuketici-elektronigi'
];
const MAX_PAGES_PER_QUERY = 20;

function parsePrice(text) {
  try {
    return parseFloat(text.replace('.', '').replace(',', '.').replace('TL', '').replace('₺', '').trim());
  } catch {
    return null;
  }
}


async function scrapeSearchPages(page, query, businessId) {
  const results = [];

  for (let pageNum = 1; pageNum <= MAX_PAGES_PER_QUERY; pageNum++) {
    const url = `${BASE_URL}/arama/?src=${encodeURIComponent(query)}&page=${pageNum}`;
    console.log(`📄 Fetching: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch {
      console.warn(`⚠️ Timeout on ${query} page ${pageNum}, skipping.`);
      break;
    }

    const cards = await page.$$('div.productItem');
    if (cards.length === 0) {
      console.log(`⛔ No products on ${query} page ${pageNum}, stopping.`);
      break;
    }

    for (const card of cards) {
      try {
        const name = await card.$eval("strong[itemprop='name']", el => el.innerText.trim());
        const priceText = await card.$eval("b.b2 p", el => el.innerText.trim());
        const price = parsePrice(priceText);

        let stockCode = '';
        try {
          const stockText = await card.$eval(".productItemStockCode", el => el.innerText);
          if (stockText.includes("Stok Kodu")) {
            stockCode = stockText.split(":")[1].trim();
          }
        } catch {}

        let image = '';
        if (stockCode) {
          image = `${BASE_URL}/thumb.ashx?width=500&height=500&Resim=/Resim/Minik/500x500_thumb_${stockCode}.jpg`;
        } else {
          try {
            const src = await card.$eval("img", img => img.getAttribute("src"));
            image = src?.startsWith('http') ? src : BASE_URL + src;
          } catch {}
        }

        let productUrl = '';
        try {
          const href = await card.$eval('a', a => a.getAttribute('href'));
          productUrl = href?.startsWith('http') ? href : BASE_URL + href;
        } catch {
          productUrl = `${BASE_URL}/arama/?src=${encodeURIComponent(name)}`;
        }

        await Product.findOneAndUpdate(
          { productUrl },
          {
            name,
            price,
            business: businessId,
            businessName: 'Digikey Computer',
            image,
            productUrl,
            $addToSet: { categories: query },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true, new: true }
        );

        results.push(productUrl);
      } catch {
        continue;
      }
    }
  }

  return results.length;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const businessName = 'Digikey Computer';
  const location = { type: 'Point', coordinates: [33.9187, 35.1549] };

  let business = await Business.findOne({ name: businessName });
  if (!business) {
    business = await Business.create({ name: businessName, website: BASE_URL, location });
    console.log('✅ Business created');
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  let total = 0;
  for (const query of SEARCH_QUERIES) {
    const count = await scrapeSearchPages(page, query, business._id);
    total += count;
  }

  await browser.close();
  console.log(`✅ Toplam ${total} ürün işlendi veya güncellendi.`);
  process.exit();
}

main().catch((err) => {
  console.error('❌ Scraper error:', err);
  process.exit(1);
});
