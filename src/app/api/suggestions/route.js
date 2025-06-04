// ✅ /api/suggestions/route.js

import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.trim() === '') {
    return NextResponse.json({ suggestions: [] });
  }

  const regex = new RegExp(q.trim(), 'i');

  const result = await Product.aggregate([
    {
      $match: {
        $or: [
          { group_title: regex },
          { brand: regex },
          { main_category: regex },
          { subcategory: regex },
          { category_item: regex },
          { category_slug: regex }
        ]
      }
    },
    {
      $project: {
        _id: 0,
        group_title: 1,
        brand: 1,
        main_category: 1,
        subcategory: 1,
        category_item: 1,
        category_slug: 1
      }
    },
    { $limit: 20 }
  ]);

  // 🔁 Öneri setleri oluştur
  const unique = (arr) => [...new Set(arr.filter(Boolean))];

  const suggestions = {
    group_titles: unique(result.map(r => r.group_title)),
    brands: unique(result.map(r => r.brand)),
    main_categories: unique(result.map(r => r.main_category)),
    subcategories: unique(result.map(r => r.subcategory)),
    items: unique(result.map(r => r.category_item)),
    category_slugs: unique(result.map(r => r.category_slug))
  };

  return NextResponse.json(suggestions);
}
