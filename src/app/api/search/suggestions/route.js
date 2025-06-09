// ✅ src/app/api/suggestions/route.js — Autocomplete API

import Product from '@/models/Product';
import { connectDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-utils';

export async function GET(req) {
  try {
    await connectDB();
    const searchParams = new URL(req.url).searchParams;
    const query = searchParams.get('q')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit')) || 10, 50);

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const regex = new RegExp(query, 'i');

    const [brands, items, subs, mains] = await Promise.all([
      Product.distinct('brand', { brand: regex }),
      Product.distinct('category_item', { category_item: regex }),
      Product.distinct('subcategory', { subcategory: regex }),
      Product.distinct('main_category', { main_category: regex })
    ]);

    const sanitize = (arr) => [...new Set(arr.filter(Boolean))].slice(0, limit);

    return NextResponse.json({
      suggestions: {
        brands: sanitize(brands),
        category_items: sanitize(items),
        subcategories: sanitize(subs),
        main_categories: sanitize(mains),
      },
    });
  } catch (err) {
    console.error('SUGGESTIONS ERROR', err);
    return errorResponse('Internal Server Error', 500);
  }
}
