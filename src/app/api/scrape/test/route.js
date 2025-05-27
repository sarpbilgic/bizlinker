import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data: html } = await axios.get('https://durmazz.com/tr', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(html);

    const products = [];

    $('.product-layout').each((_, el) => {
      const name = $(el).find('.name a').text().trim();
      const priceText = $(el).find('.price').first().text().replace(/[^\d.,]/g, '').replace(',', '.');
      const price = parseFloat(priceText) || 0;
      const image = $(el).find('img').attr('src') || '';
      const url = $(el).find('.name a').attr('href');
      const fullUrl = url?.startsWith('http') ? url : `https://durmazz.com${url}`;

      if (name && price > 0) {
        products.push({ name, price, image, url: fullUrl });
      }
    });

    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found. Page may be JavaScript-rendered.' }, { status: 400 });
    }

    return NextResponse.json({ count: products.length, products }, { status: 200 });
  } catch (error) {
    console.error('Scrape failed:', error.message);
    return NextResponse.json({ error: 'Scrape failed', details: error.message }, { status: 500 });
  }
}
