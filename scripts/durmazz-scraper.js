import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import mongoose from 'mongoose';
import slugify from 'slugify';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Product from '../src/models/Product.js';
import Business from '../src/models/Business.js';

dotenv.config();
puppeteer.use(StealthPlugin());

const BASE_URL = 'https://www.durmazz.com';
const SHOP_PATH = '/tr/shop';
const businessName = 'Durmazz';
const businessAddress = 'Avenue AVM, Mehmet Akif Cd No: 1-2, Lefkoşa 99010';
const businessCoordinates = [33.3696, 35.1754];

async function getExchangeRate() {
  try {
    const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=TRY');
    const data = await res.json();
    return data.rates.TRY || 39;
  } catch {
    console.warn('⚠️ Failed to fetch exchange rate, using fallback.');
    return 39;
  }
}

function extractPrice(text) {
  const cleaned = text.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
  return parseFloat(cleaned);
}

const runScraper = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const exchangeRate = await getExchangeRate();
    console.log(`💱 USD/TRY = ${exchangeRate}`);

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

    let pageNum = 1;
    let now = new Date();

    while (true) {
      const url = `${BASE_URL}${SHOP_PATH}?page=${pageNum}`;
      console.log(`🔍 Scraping: ${url}`);

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#products_grid form', { timeout: 20000 });
      } catch (err) {
        console.warn(`⛔ Page ${pageNum} load failed:`, err.message);
        break;
      }

      const forms = await page.$$('#products_grid form');
      if (!forms.length) break;

      for (let form of forms) {
        try {
          const nameEl = await form.$('h6 > a');
          const name = await page.evaluate(el => el?.innerText?.trim(), nameEl);
          if (!name) continue;

          let link = await page.evaluate(el => el?.getAttribute('href'), nameEl);
          if (!link.startsWith('http')) link = BASE_URL + link;

          const priceEl = await form.$('span.h6.text-primary.mb-0 > span');
          const priceText = await page.evaluate(el => el?.innerText?.trim(), priceEl);
          const priceUSD = extractPrice(priceText);
          const priceTL = Math.round(priceUSD * exchangeRate);

          const imgEl = await form.$('img');
          let image = await page.evaluate(el => el?.getAttribute('src'), imgEl);
          if (image && !image.startsWith('http')) image = BASE_URL + image;

          if (!priceTL || !link) continue;

          const group_title = name;
          const group_slug = slugify(name, { lower: true });

          const updated = await Product.findOneAndUpdate(
            { productUrl: link },
            {
              name,
              price: priceTL,
              image,
              productUrl: link,
              business: business._id,
              businessName,
              group_title,
              group_slug,
              updatedAt: now,
              $setOnInsert: { createdAt: now },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          const isNew = updated.createdAt.getTime() === now.getTime();
          if (isNew) console.log(`🆕 New: ${name}`);
          else console.log(`✅ Updated: ${name}`);
        } catch (err) {
          console.warn('⚠️ Product error:', err.message);
          continue;
        }
      }

      pageNum++;
    }

    await browser.close();

    // ❌ Eski ürünleri sil
    const deleted = await Product.deleteMany({
      business: business._id,
      $expr: { $eq: ['$createdAt', '$updatedAt'] },
      updatedAt: { $lt: now }
    });

    console.log(`🗑️ ${deleted.deletedCount} eski ürün silindi.`);

    await mongoose.disconnect();
    console.log('🎉 Scraping completed.');
  } catch (err) {
    console.error('💥 Scraper error:', err);
    process.exit(1);
  }
};

runScraper();
