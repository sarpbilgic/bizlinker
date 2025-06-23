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
  { slug: 'mobil-ve-aksesuar-174', pages: 10 },
  { slug: 'kulaklk-hoparlor-298', pages: 10 },
  { slug: 'televizyon-182', pages: 3 },
  { slug: 'bilgisayar-oyun-207', pages: 10 },
  { slug: 'kucuk-ev-aletleri-233', pages: 15 },
];

const BASE_URL = 'https://sharafstore.com/tr/shop/category';
const businessName = 'SharafStore';
const businessAddress = 'Avenue AVM, Mehmet Akif Cd No: 1-2, Lefkoşa 99010';
const businessCoordinates = [33.3666, 35.1903]; // Longitude, Latitude

function extractPrice(priceText) {
  return parseFloat(
    priceText.replace(/\./g, '').replace(',', '.').replace(/[^0-9.,]/g, '')
  );
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    let business = await Business.findOne({ name: businessName });
    if (!business) {
      business = await Business.create({
        name: businessName,
        website: 'https://sharafstore.com',
        address: businessAddress,
        location: { type: 'Point', coordinates: businessCoordinates },
      });
      console.log('🏢 Business created');
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000,
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);

    for (const { slug, pages } of categories) {
      for (let pageNum = 1; pageNum <= pages; pageNum++) {
        const url = `${BASE_URL}/${slug}/page/${pageNum}?order=name+desc`;
        console.log(`🔍 Scraping: ${url}`);

        let loadSuccess = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('td.oe_product', { timeout: 20000 });
            loadSuccess = true;
            break;
          } catch (err) {
            console.warn(`⏳ Retry ${attempt + 1} for ${url}`);
            await page.reload({ waitUntil: 'domcontentloaded' });
          }
        }
        if (!loadSuccess) {
          console.warn(`❌ Failed to load ${url} after 3 tries.`);
          continue;
        }

        const products = await page.$$eval('td.oe_product', (items) => {
          return items
            .map((el) => {
              const name = el.querySelector('a.product_name')?.innerText?.trim();
              const priceText = el.querySelector('span.oe_currency_value')?.innerText;
              const imageRel = el.querySelector('img')?.getAttribute('src');
              const urlRel = el.querySelector("a[itemprop='url']")?.getAttribute('href');

              return name && priceText && imageRel && urlRel
                ? { name, priceText, imageRel, urlRel }
                : null;
            })
            .filter(Boolean);
        });

        for (const product of products) {
          try {
            const productUrl = `https://sharafstore.com${product.urlRel}`;
            const image = `https://sharafstore.com${product.imageRel}`;
            const price = extractPrice(product.priceText);
            const group_title = product.name.trim();
            const group_slug = slugify(group_title, { lower: true });

            await Product.findOneAndUpdate(
              { productUrl },
              {
                name: product.name,
                price,
                image,
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
            console.error(`❌ Product error at ${url}:`, err.message);
            continue;
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