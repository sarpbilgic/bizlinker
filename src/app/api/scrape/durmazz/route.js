import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Business from '@/models/Business';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    const siteURL = 'https://durmazz.com/tr';
    const businessName = 'Durmazz';
    const businessUrl = 'https://durmazz.com';

    // 1. İşletmeyi kaydet (varsa tekrar etmesin)
    let business = await Business.findOne({ name: businessName });
    if (!business) {
      business = await Business.create({
        name: businessName,
        website: businessUrl,
        location: {
          type: 'Point',
          coordinates: [33.9461, 35.1299], // Gazimağusa default
        },
      });
    }

    // 2. HTML çek
    const { data: html } = await axios.get(siteURL);
    const $ = cheerio.load(html);
    const scrapedProducts = [];

    $('.product-layout').each((_, el) => {
      const name = $(el).find('.name a').text().trim();
      const priceText = $(el).find('.price').first().text().replace(/[^\d.,]/g, '').replace(',', '.');
      const price = parseFloat(priceText) || 0;
      const image = $(el).find('img').attr('src') || '';
      const url = $(el).find('.name a').attr('href');
      const fullUrl = url?.startsWith('http') ? url : `https://durmazz.com${url}`;

      if (name && price > 0) {
        scrapedProducts.push({
          name,
          price,
          brand: '',
          category: '',
          image,
          productUrl: fullUrl,
          business: business._id,
        });
      }
    });

    // 3. Ürünleri kaydet
    const results = [];
    for (const product of scrapedProducts) {
      const result = await Product.findOneAndUpdate(
        { productUrl: product.productUrl },
        product,
        { upsert: true, new: true }
      );
      results.push(result);
    }

    return NextResponse.json({ message: `✅ ${results.length} ürün işlendi.` }, { status: 200 });
  } catch (err) {
    console.error('Scrape error:', err);
    return NextResponse.json({ error: 'Scrape failed' }, { status: 500 });
  }
}
