import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import Business from '../src/models/Business.js';

dotenv.config();

const BASE_URL = 'https://durmazz.com';
const EXCHANGE_RATE = 39;

function parsePrice(text) {
  try {
    return parseFloat(
      text.replace('.', '').replace(',', '.').replace('TL', '').replace('₺', '').trim()
    );
  } catch {
    return null;
  }
}

function detectBrand(name) {
  return name.split(' ')[0] || '';
}

async function scrapeAllPages(page, businessId) {
  const allProducts = [];
  let pageNum = 1;

  while (pageNum <= 85) {
    const url = `${BASE_URL}/tr/shop?page=${pageNum}`;
    console.log(`Fetching: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.warn(`Timeout on page ${pageNum}, stopping.`);
      break;
    }

    const productForms = await page.$$(`#products_grid form`);
    if (productForms.length === 0) {
      console.log(`No products found on page ${pageNum}, ending early.`);
      break;
    }

    for (let form of productForms) {
      try {
        const nameEl = await form.$('h6 > a');
        const name = await page.evaluate(el => el?.innerText?.trim(), nameEl);
        if (!name) continue;

        let link = await page.evaluate(el => el?.getAttribute('href'), nameEl);
        if (!link.startsWith('http')) link = BASE_URL + link;

        const priceEl = await form.$('span.h6.text-primary.mb-0 > span');
        const priceText = await page.evaluate(el => el?.innerText?.trim(), priceEl);
        const priceUSD = parsePrice(priceText);
        const priceTL = Math.round(priceUSD * EXCHANGE_RATE);

        const imageEl = await form.$('img');
        let image = await page.evaluate(el => el?.getAttribute('src'), imageEl);
        if (image && !image.startsWith('http')) image = BASE_URL + image;

        if (!priceTL) continue;

        const brand = detectBrand(name);

        await Product.findOneAndUpdate(
          { productUrl: link },
          {
            name,
            price: priceTL,
            brand,
            categories: [],
            image,
            productUrl: link,
            business: businessId,
          },
          { upsert: true, new: true }
        );

        allProducts.push(name);
      } catch (err) {
        continue;
      }
    }

    pageNum++;
  }

  return allProducts.length;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const businessName = 'Durmazz';
  const businessUrl = BASE_URL;
  const location = { type: 'Point', coordinates: [33.9461, 35.1299] };

  let business = await Business.findOne({ name: businessName });
  if (!business) {
    business = await Business.create({ name: businessName, website: businessUrl, location });
    console.log('Business created');
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const total = await scrapeAllPages(page, business._id);

  await browser.close();
  console.log(`Toplam ${total} ürün MongoDB’ye işlendi`);
  process.exit();
}

main().catch((err) => {
  console.error(' Scraper error:', err);
  process.exit(1);
});
