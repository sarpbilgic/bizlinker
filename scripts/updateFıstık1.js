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
  'ses-sistemleri--kulaklıklar',
  'yazicilar--ofis-ve-sarf-malzemeleri',
  'aksesuarlar'
];

const MAX_RETRIES = 4;
const MAX_PAGES = 25;

function parsePrice(priceStr) {
  try {
    return parseFloat(priceStr.replace(/[^\d,]/g, '').replace(',', '.'));
  } catch {
    return null;
  }
}

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function scrapeCategory(page, category, businessId) {
  let updated = 0, skipped = 0;

  for (let i = 1; i <= MAX_PAGES; i++) {
    const url = `${BASE_URL}/${category}?sayfa=${i}`;
    console.log(`🔎 Sayfa: ${url}`);

    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 90000
        });
        await page.waitForSelector('.productItem', { timeout: 15000 });
        break;
      } catch (err) {
        attempt++;
        console.warn(`⚠️ Timeout ${category} sayfa ${i} (deneme ${attempt})`);
        if (attempt === MAX_RETRIES) return { updated, skipped };
      }
    }

    const products = await page.$$('.productItem');
    if (!products.length) {
      console.log(`⛔ Ürün bulunamadı: ${category} sayfa ${i}, çıkılıyor.`);
      break;
    }

    for (const product of products) {
      try {
        await product.hover();
        await product.evaluate(el => el.scrollIntoView());
        await delay(500);

        const name = await product.$eval('.productName a', el => el.innerText.trim());
        const productPath = await product.$eval('.productName a', el => el.getAttribute('href'));
        const productUrl = productPath?.startsWith('http') ? productPath : BASE_URL + productPath;

        const priceText = await product.$eval('.discountPriceSpan', el => el.innerText.trim());

        const imageRaw = await product.$eval('img', img => {
          const srcset = img.getAttribute('srcset');
          if (srcset) {
            const firstSrc = srcset.split(',')[0]?.trim().split(' ')[0];
            if (firstSrc) return firstSrc;
          }
          return (
            img.getAttribute('data-original') ||
            img.getAttribute('data-src') ||
            img.getAttribute('src')
          );
        });
        const image = imageRaw?.startsWith('http') ? imageRaw : `${BASE_URL}${imageRaw}`;

        const price = parsePrice(priceText);
        if (!name || !price || !productUrl) continue;

        const existing = await Product.findOne({ productUrl });

        if (existing) {
          let shouldUpdate = false;
          const updateFields = { updatedAt: new Date() };

          if (existing.price !== price) {
            updateFields.price = price;
            updateFields.$push = { priceHistory: { price, date: new Date() } };
            shouldUpdate = true;
          }

          if (image && !image.toLowerCase().includes('load.gif') && image !== existing.image) {
            updateFields.image = image;
            shouldUpdate = true;
          }

          if (shouldUpdate) {
            await Product.updateOne(
              { _id: existing._id },
              {
                $set: updateFields,
                ...(updateFields.$push && { $push: updateFields.$push })
              }
            );
            console.log(`✅ Güncellendi: ${name}`);
            updated++;
          } else {
            skipped++;
            console.log(`🟡 Değişiklik yok: ${name}`);
          }
        } else {
          console.log(`⏩ Yeni ürün tespit edildi, eklenmedi: ${name}`);
        }
      } catch (e) {
        console.warn('⚠️ Ürün ayrıştırılamadı:', e.message);
        continue;
      }
    }
  }

  return { updated, skipped };
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('📦 MongoDB bağlantısı kuruldu');

  const businessName = 'Fıstık Bilgisayar';
  const location = { type: 'Point', coordinates: [33.9167, 35.15] };

  let business = await Business.findOne({ name: businessName });
  if (!business) {
    business = await Business.create({ name: businessName, website: BASE_URL, location });
    console.log('🏢 İşletme eklendi');
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let totalUpdated = 0, totalSkipped = 0;

  for (const category of categories) {
    const { updated, skipped } = await scrapeCategory(page, category, business._id);
    console.log(`📂 ${category}: ${updated} güncellendi / ${skipped} atlandı`);
    totalUpdated += updated;
    totalSkipped += skipped;
  }

  await browser.close();
  console.log(`\n🎯 Toplam: ${totalUpdated} güncellendi, ${totalSkipped} atlandı`);
  process.exit();
}

main().catch(err => {
  console.error('❌ Scraper error:', err);
  process.exit(1);
});
