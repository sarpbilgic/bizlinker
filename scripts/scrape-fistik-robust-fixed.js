
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import Business from '../src/models/Business.js';

dotenv.config();
puppeteer.use(StealthPlugin());

const BASE_URL = 'https://www.fistikbilgisayar.com';
const categories = [
  'bilgisayar',
  'gaming-urunler',
  'bilgisayar-parcalari',
  'cevre-birimleri',
  'telefon',
  'ag-urunleri',
  'ses-sistemleri--kulaklar',
  'yazicilar--ofis-ve-sarf-malzemeleri',
  'aksesuarlar'
];

const MAX_RETRIES = 3;
const MAX_PAGES = 20;

function parsePrice(priceStr) {
  try {
    return parseFloat(priceStr.replace(/[^\d,]/g, '').replace(',', '.'));
  } catch {
    return null;
  }
}

async function scrapeCategory(page, category, businessId) {
  let totalProducts = 0;

  for (let i = 1; i <= MAX_PAGES; i++) {
    const url = `${BASE_URL}/${category}?sayfa=${i}`;
    console.log('📄 Fetching:', url);

    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });
        await page.waitForSelector('.productItem', { timeout: 10000 });
        break;
      } catch (err) {
        attempt++;
        console.warn(`⚠️ Timeout on ${category} page ${i}, retry ${attempt}`);
        if (attempt === MAX_RETRIES) return totalProducts;
      }
    }

    const products = await page.$$('.productItem');
    if (!products.length) {
      console.log(`⛔ No products found on ${category} page ${i}, stopping.`);
      break;
    }

    for (const product of products) {
      try {
        const name = await product.$eval('.productName a', el => el.innerText.trim());
        const productUrl = await product.$eval('.productName a', (el, base) => base + el.getAttribute('href'), BASE_URL);
        const priceText = await product.$eval('.discountPriceSpan', el => el.innerText.trim());
        const image = await product.$eval('img', el => el.getAttribute('src'));
        const price = parsePrice(priceText);

        if (!name || !price || !productUrl) continue;

        await Product.findOneAndUpdate(
          { productUrl },
          {
            name,
            price,
            business: businessId,
            businessName: 'Fıstık Bilgisayar',
            image,
            productUrl,
            $setOnInsert: {
              categories: [category],
              createdAt: new Date()
            }
          },
          { upsert: true, new: true }
        );

        totalProducts++;
      } catch (e) {
        console.warn('⚠️ Error parsing product:', e.message);
        continue;
      }
    }
  }

  return totalProducts;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const businessName = 'Fıstık Bilgisayar';
  const location = { type: 'Point', coordinates: [33.9167, 35.15] };

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
    console.log(`✅ ${count} ürün işlendi (${category})`);
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
