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
  { slug: 'ev-aletleri-ve-yasam', pages: 35 },
  { slug: 'beyaz-esyalar', pages: 18 },
  { slug: 'bilgisayar-tablet-ve-oyun', pages: 18 },
  { slug: 'isitma-ve-sogutma-sistemleri', pages: 10 },
  { slug: 'kisisel-bakim-ve-saglik', pages: 12 },
  { slug: 'kulaklıklar', pages: 10 },
  { slug: 'spor-ve-hobi', pages: 7 },
  { slug: 'telefon', pages: 30 },
  { slug: 'televizyon-ve-ses-sistemleri', pages: 12 },
];

const BASE_URL = 'https://technopluskibris.com';
const businessName = 'Technoplus';
const businessAddress = 'Famagusta';
const businessCoordinates = [33.3636, 35.1708];

function extractPrice(text) {
  return parseFloat(text.replace(/\./g, '').replace(',', '.').replace(/[^0-9.,]/g, ''));
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
        const url = `${BASE_URL}/${slug}?p=${i}`;
        console.log(`🔍 Scraping: ${url}`);

        let success = false;
        for (let retry = 0; retry < 3; retry++) {
          try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('.productItem', { timeout: 20000 });
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

        const products = await page.$$eval('.productItem', (items) => {
          return items.map((el) => {
            const name = el.querySelector('.productItemTitle a strong')?.innerText?.trim();
            const urlRel = el.querySelector('.productItemTitle a')?.getAttribute('href');
            const image = el.querySelector('.productItemImage img')?.getAttribute('src');
            const priceText = el.querySelector('.productPrice .b2 p')?.innerText?.trim();

            return name && urlRel && image && priceText
              ? { name, urlRel, image, priceText }
              : null;
          }).filter(Boolean);
        });

        for (const product of products) {
          try {
            const productUrl = `${BASE_URL}${product.urlRel}`;
            const price = extractPrice(product.priceText);
            const group_title = product.name;
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
            await new Promise((r) => setTimeout(r, 200));
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
