import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import mongoose from 'mongoose';
import slugify from 'slugify';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import Business from '../src/models/Business.js';

dotenv.config();
puppeteer.use(StealthPlugin());

const categories = [
  { slug: 'elektronik-25100', pages: 60 },
  { slug: 'bilgisayar-25278', pages: 20 },
  { slug: 'beyaz-esya-25201', pages: 6 },
  { slug: 'kisisel-bakim-temizlik-urunleri-25249', pages: 6 },
  { slug: 'ev-ofis-yasam-25402', pages: 22 },
  { slug: 'isitma-sogutma-sistemleri-25619', pages: 4 },
  { slug: 'yapi-urunleri-25553', pages: 3 },
];

const BASE_URL = 'https://www.teknogoldonline.com';
const businessName = 'Teknogold';
const businessAddress = 'Kyrenia';
const businessCoordinates = [32.8597, 39.9334];

function extractPrice(priceText) {
  return parseFloat(priceText.replace(/\./g, '').replace(',', '.').replace(/[^0-9.,]/g, ''));
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    let business = await Business.findOne({ name: businessName });
    if (!business) {
      business = await Business.create({
        name: businessName,
        website: BASE_URL,
        address: businessAddress,
        location: { type: 'Point', coordinates: businessCoordinates },
      });
      console.log('🏢 Business created');
    }

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);

    for (const { slug, pages } of categories) {
      for (let i = 1; i <= pages; i++) {
        const url = `${BASE_URL}/${slug}?sayfa=${i}`;
        console.log(`🔍 Scraping: ${url}`);

        let success = false;
        for (let retry = 0; retry < 3; retry++) {
          try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('.ItemOrj', { timeout: 20000 });
            success = true;
            break;
          } catch (err) {
            console.warn(`⏳ Retry ${retry + 1} for ${url}`);
            await page.reload({ waitUntil: 'domcontentloaded' });
          }
        }
        if (!success) {
          console.warn(`❌ Failed to load ${url} after retries.`);
          continue;
        }

        const products = await page.$$eval('.ItemOrj', (items) => {
          return items.map((el) => {
            const name = el.querySelector('.productName a')?.innerText?.trim();
            const urlRel = el.querySelector('.productName a')?.getAttribute('href');
            const image = el.querySelector('.productImage img')?.getAttribute('src');
            const priceText = el.querySelector('.discountPriceSpan')?.innerText?.trim();
            return name && urlRel && image && priceText
              ? { name, urlRel, image, priceText }
              : null;
          }).filter(Boolean);
        });

        for (const product of products) {
          try {
            const productUrl = `${BASE_URL}${product.urlRel}`;
            const price = extractPrice(product.priceText);
            const group_title = product.name.trim();
            const group_slug = slugify(group_title, { lower: true });

            await Product.findOneAndUpdate(
              { productUrl },
              {
                name: product.name,
                price,
                image: product.image,
                productUrl,
                business: business._id,
                businessName,
                group_title,
                group_slug,
                updatedAt: new Date(),
                $setOnInsert: { createdAt: new Date() },
              },
              { upsert: true, new: true }
            );
            console.log(`✅ Saved: ${product.name}`);
            await new Promise(r => setTimeout(r, 200));
          } catch (err) {
            console.error(`❌ Error for product ${product.name}:`, err.message);
          }
        }
      }
    }

    await browser.close();
    await mongoose.disconnect();
    console.log('🎉 Scraping completed.');
  } catch (err) {
    console.error('❌ Scraper execution error:', err);
    process.exit(1);
  }
}

main();
