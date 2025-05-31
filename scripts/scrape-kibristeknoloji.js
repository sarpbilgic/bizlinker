import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import Business from '../src/models/Business.js';

dotenv.config();
puppeteer.use(StealthPlugin());

const BASE_URL = 'https://www.kibristeknoloji.com';
const EXCHANGE_RATE = 39;
const MAX_PAGES = 5;

const categories = [
  'tv-ev-elektronigi',
  'bilgisayar-tablet',
  'pc-bilesenleri',
  'gaming-urunler',
  'ofis-kirtasiye',
  'barkod-urunleri',
  'oyun-ve-hobi',
  'ev-yasam',
  'guvenlik-urunleri',
  'cevre-birimleri',
  'ag-urunleri',
  'telefon-aksesuar'
];

function parsePrice(priceStr) {
  try {
    return parseFloat(priceStr.replace(/[.,]/g, m => (m === '.' ? '' : '.')).replace(/[^\d.]/g, ''));
  } catch {
    return null;
  }
}

function detectBrand(name) {
  return name?.split(' ')[0] || '';
}

async function scrapeCategory(page, category, businessId) {
  let totalProducts = 0;

  for (let i = 1; i <= MAX_PAGES; i++) {
    const url = `${BASE_URL}/kategori/${category}?page=${i}`;
    console.log('📄 Fetching:', url);

    let loadSuccess = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.waitForSelector('.card-grid-style-3', { timeout: 20000 });
        loadSuccess = true;
        break;
      } catch (err) {
        console.warn(`🔁 Retry ${attempt + 1} for ${url}`);
        await page.reload({ waitUntil: 'domcontentloaded' });
      }
    }
    if (!loadSuccess) {
      console.warn(`❌ Failed to load ${url} after 3 tries.`);
      continue;
    }

    const cards = await page.$$('.card-grid-style-3');
    if (!cards.length) {
      console.log(`⛔ No product cards found on ${url}`);
      continue;
    }

    for (const [index, card] of cards.entries()) {
      try {
        const name = await card.$eval('.product-title', el => el.innerText.trim());
        const productUrl = await card.$eval('.product-title', el => 'https://www.kibristeknoloji.com' + el.getAttribute('href'));
        const priceText = await card.$eval('.price-main', el => el.innerText.trim());
        const image = await card.$eval('.image-box img', el => el.getAttribute('src'));

        const priceUSD = parsePrice(priceText);
        const priceTL = Math.round(priceUSD * EXCHANGE_RATE);
        const brand = detectBrand(name);

        if (!name || !priceTL || !productUrl) {
          console.warn(`⚠️ Incomplete product at index ${index}, skipped.`);
          continue;
        }

        await Product.findOneAndUpdate(
          { productUrl },
          {
            name,
            price: priceTL,
            brand,
            business: businessId,
            businessName: 'Kıbrıs Teknoloji',
            image,
            productUrl,
            $setOnInsert: {
              categories: [category],
              createdAt: new Date()
            }
          },
          { upsert: true, new: true }
        );

        console.log(`✅ Saved: ${name}`);
        await new Promise(resolve => setTimeout(resolve, 200)); 
        totalProducts++;
      } catch (err) {
        console.error(`❌ Product error at index ${index} on ${url}:`, err.message);
        continue;
      }
    }
  }

  return totalProducts;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const businessName = 'Kıbrıs Teknoloji';
  const location = { type: 'Point', coordinates: [33.9056, 35.1676] };

  let business = await Business.findOne({ name: businessName });
  if (!business) {
    business = await Business.create({ name: businessName, website: BASE_URL, location });
    console.log('✅ Business created');
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let grandTotal = 0;

  for (const category of categories) {
    const count = await scrapeCategory(page, category, business._id);
    console.log(`📦 ${count} ürün işlendi (${category})`);
    grandTotal += count;
  }

  await browser.close();
  console.log(`🎉 Toplam ${grandTotal} ürün işlendi veya güncellendi.`);
  process.exit();
}

main().catch(err => {
  console.error('❌ Scraper error:', err);
  process.exit(1);
});
