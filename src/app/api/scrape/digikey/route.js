import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Business from '@/models/Business';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    const siteURL = 'https://www.digikeycomputer.com/';
    const businessName = 'Digikey Computer';
    const businessUrl = 'https://www.digikeycomputer.com';

    // 1. Business kontrol / ekle
    let business = await Business.findOne({ name: businessName });
    if (!business) {
      business = await Business.create({
        name: businessName,
        website: businessUrl,
        location: {
          type: 'Point',
          coordinates: [33.9187, 35.1549], // Lefkoşa örnek konum
        },
      });
    }

    // 2. HTML çek
    const { data: html } = await axios.get(siteURL);
    const $ = cheerio.load(html);

    const scrapedProducts = [];

    $('.product').each((_, el) => {
      const name = $(el).find('.product-title').text().trim();
      const priceText = $(el).find('.price').first().text().replace(/[^\d.,]/g, '').replace(',', '.');
      const price = parseFloat(priceText) || 0;
      const image = $(el).find('img').attr('src') || '';
      const url = $(el).find('a').attr('href');
      const fullUrl = url?.startsWith('http') ? url : `${siteURL}${url}`;

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

    // 3. Ürünleri veritabanına işle
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
