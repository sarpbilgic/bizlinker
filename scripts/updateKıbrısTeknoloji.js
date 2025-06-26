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
const MAX_RETRIES = 3;

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
    return parseFloat(
      priceStr.replace(/[.,]/g, m => (m === '.' ? '' : '.')).replace(/[^\d.]/g, '')
    );
  } catch {
    return null;
  }
}

async function scrapeCategory(page, category, businessId) {
  let updated = 0, skipped = 0;

  for (let i = 1; i <= MAX_PAGES; i++) {
    const url = `${BASE_URL}/kategori/${category}?page=${i}`;
    console.log(`🔍 Fetching: ${url}`);

    let success = false;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.waitForSelector('.card-grid-style-3', { timeout: 20000 });
        success = true;
        break;
      } catch {
        console.warn(`⏳ Retry ${attempt + 1} for ${url}`);
        await page.reload({ waitUntil: 'domcontentloaded' });
      }
    }

    if (!success) {
      console.warn(`❌ Failed after ${MAX_RETRIES} retries: ${url}`);
      continue;
    }

    const cards = await page.$$('.card-grid-style-3');
    if (!cards.length) {
      console.log(`⚠️ No products on ${url}`);
      continue;
    }

    for (const [index, card] of cards.entries()) {
      try {
        const name = await card.$eval('.product-title', el => el.innerText.trim());
        const path = await card.$eval('.product-title', el => el.getAttribute('href'));
        const productUrl = path.startsWith('http') ? path : BASE_URL + path;

        const priceText = await card.$eval('.price-main', el => el.innerText.trim());
        const imageRaw = await card.$eval('.image-box img', el => el.getAttribute('src'));
        const image = imageRaw?.startsWith('http') ? imageRaw : BASE_URL + imageRaw;

        const priceUSD = parsePrice(priceText);
        const priceTL = Math.round(priceUSD * EXCHANGE_RATE);
        if (!name || !priceTL || !productUrl) continue;

        const existing = await Product.findOne({ productUrl });

        if (existing) {
          if (existing.price !== priceTL) {
            await Product.updateOne(
              { _id: existing._id },
              {
                $set: {
                  price: priceTL,
                  image,
                  updatedAt: new Date(),
                },
                $push: {
                  priceHistory: { price: priceTL, date: new Date() },
                },
              }
            );
            console.log(`✅ Güncellendi: ${name} (${existing.price} → ${priceTL})`);
            updated++;
          } else {
            console.log(`🟡 Fiyat aynı: ${name}`);
            skipped++;
          }
        } else {
          console.log(`⏩ Yeni ürün tespit edildi, eklenmedi: ${name}`);
        }

        await new Promise(resolve => setTimeout(resolve, 150));
      } catch (err) {
        console.warn(`⚠️ Hata (ürün ${index}):`, err.message);
        continue;
      }
    }
  }

  return { updated, skipped };
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('📦 MongoDB bağlı');

  const businessName = 'Kıbrıs Teknoloji';
  const location = { type: 'Point', coordinates: [33.9056, 35.1676] };

  let business = await Business.findOne({ name: businessName });
  if (!business) {
    business = await Business.create({ name: businessName, website: BASE_URL, location });
    console.log('🏪 İşletme eklendi');
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let totalUpdated = 0, totalSkipped = 0;

  for (const category of categories) {
    const { updated, skipped } = await scrapeCategory(page, category, business._id);
    totalUpdated += updated;
    totalSkipped += skipped;
    console.log(`📂 ${category}: ${updated} güncellendi / ${skipped} atlandı`);
  }

  await browser.close();
  console.log(`\n🎯 Toplam: ${totalUpdated} güncellendi / ${totalSkipped} atlandı`);
  process.exit();
}

main().catch(err => {
  console.error('💥 Scraper error:', err);
  process.exit(1);
});
