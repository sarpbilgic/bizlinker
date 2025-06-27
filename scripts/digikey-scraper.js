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
  { slug: 'bilgisayar', pages: 8 },
  { slug: 'ag-urunleri', pages: 8 },
  { slug: 'bilgisayar-parcalari', pages: 23 },
  { slug: 'cevre-birimleri', pages: 37 },
  { slug: 'depolama-urunleri', pages: 4 },
  { slug: 'oyuncu-ekipmanlari', pages: 14 },
  { slug: 'telefon', pages: 16 },
  { slug: 'tuketici-elektronigi', pages: 17 },
];

const BASE_URL = 'https://www.digikeycomputer.com';
const businessName = 'Digikey Computer';
const businessAddress = 'Lefkoşa, KKTC';
const businessCoordinates = [33.3644, 35.1926];

function extractPrice(text) {
  const numeric = text.replace(/[\.,]/g, (m) => (m === '.' ? '' : '.')).replace(/[^0-9.]/g, '');
  return parseFloat(numeric);
}

const runScraper = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    let business = await Business.findOne({ name: businessName });
    if (!business) {
      business = await Business.create({
        name: businessName,
        website: BASE_URL,
        address: businessAddress,
        location: { type: 'Point', coordinates: businessCoordinates },
      });
      console.log('Business created');
    }

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);

    for (const { slug, pages } of categories) {
      for (let pageNum = 1; pageNum <= pages; pageNum++) {
        const url = `${BASE_URL}/${slug}?p=${pageNum}`;
        console.log(`🔍 Scraping: ${url}`);

        let loadSuccess = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('div.productItemBlock', { timeout: 20000 });
            loadSuccess = true;
            break;
          } catch (err) {
            console.warn(`⏳ Retry ${attempt + 1} for ${url}`);
            await page.reload({ waitUntil: 'domcontentloaded' });
          }
        }
        if (!loadSuccess) {
          console.warn(`Failed to load ${url} after 3 tries.`);
          continue;
        }

        const products = await page.$$eval('div.productItemBlock', (items) => {
          return items.map((el) => {
            const name = el.querySelector('strong[itemprop="name"]')?.innerText.trim();
            const priceText = el.querySelector('meta[itemprop="price"]')?.getAttribute('content');
            const imgSrc = el.querySelector('img[itemprop="image"]')?.getAttribute('src');
            const urlPath = el.querySelector('a[itemprop="url"]')?.getAttribute('href');
            return name && priceText && imgSrc && urlPath
              ? { name, priceText, imgSrc, urlPath }
              : null;
          }).filter(Boolean);
        });

        for (const product of products) {
          try {
            const productUrl = `${BASE_URL}${product.urlPath}`;
            const image = product.imgSrc.startsWith('http') ? product.imgSrc : `https:${product.imgSrc}`;
            const price = extractPrice(product.priceText);
            const group_title = product.name;
            const group_slug = slugify(group_title, { lower: true });

            if (!price || price === 0) continue;

            await Product.findOneAndUpdate(
              { productUrl },
              {
                $set: {
                  name: product.name,
                  price,
                  image,
                  productUrl,
                  business: business._id,
                  businessName,
                  group_title,
                  group_slug,
                  updatedAt: new Date(),
                },
                $setOnInsert: { createdAt: new Date() },
              },
              { upsert: true, new: true }
            );

            console.log(`Processed: ${product.name}`);
            await new Promise((r) => setTimeout(r, 200));
          } catch (err) {
            console.error(`Product error at ${url}:`, err.message);
            continue;
          }
        }
      }
    }

    await browser.close();
    await mongoose.disconnect();
    console.log('Scraping completed.');
  } catch (err) {
    console.error('Scraper execution error:', err);
    process.exit(1);
  }
};

export default runScraper;

//pm2 start scripts/digikey-scraper.js --name digikey-nightly
//pm2 logs digikey-nightly