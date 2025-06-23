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
  { slug: 'bilgisayar', pages: 2 },
  { slug: 'cep-telefonlari', pages: 2 },
  { slug: 'akilli-ev-aletleri', pages: 2 },
  { slug: 'aydınlatma-urunleri', pages: 1 },
  { slug: 'kisisel-bakim-urunleri', pages: 1 },
  { slug: 'kulaklıklar', pages: 1 },
  { slug: 'oyun-konsollari', pages: 1 },
  { slug: 'oyuncu-ekipmanlari', pages: 1 },
  { slug: 'spor-oyun-outdoor', pages: 1 },
];

const BASE_URL = 'https://www.irismostore.com/kategori';
const businessName = 'IrisMo Store';
const businessAddress = 'Lefkoşa, KKTC';
const businessCoordinates = [33.3731, 35.2107]; // Tahmini koordinatlar

function extractPrice(text) {
  const numeric = text.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(numeric);
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
        website: 'https://www.irismostore.com',
        address: businessAddress,
        location: { type: 'Point', coordinates: businessCoordinates },
      });
      console.log('🏢 Business created');
    }

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);

    for (const { slug, pages } of categories) {
      for (let pageNum = 1; pageNum <= pages; pageNum++) {
        const url = `${BASE_URL}/${slug}?tp=${pageNum}`;
        console.log(`🔍 Scraping: ${url}`);

        let loadSuccess = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('div.showcase', { timeout: 20000 });
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

        const products = await page.$$eval('div.showcase', (items) => {
          return items.map((el) => {
            const name = el.querySelector('.showcase-title a')?.innerText?.trim();
            const priceText = el.querySelector('.showcase-price-new')?.innerText?.trim();
            const imgSrc = el.querySelector('.showcase-image-item img')?.getAttribute('src');
            const urlPath = el.querySelector('a[aria-label="Product Detail"]')?.getAttribute('href');

            if (!priceText || priceText.includes('0') || !priceText.match(/\d/)) return null;

            return name && imgSrc && urlPath
              ? { name, priceText, imgSrc, urlPath }
              : null;
          }).filter(Boolean);
        });

        for (const product of products) {
          try {
            const productUrl = `https://www.irismostore.com${product.urlPath}`;
            const image = product.imgSrc.startsWith('http') ? product.imgSrc : `https:${product.imgSrc}`;
            const price = extractPrice(product.priceText);
            const group_title = product.name;
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
