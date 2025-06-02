// src/app/api/suggestions/route.js

import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    // Query yoksa popüler markalar, grup başlıkları ve ana kategorileri öner
    const [popularBrands, popularGroups, popularCategories] = await Promise.all([
      Product.aggregate([
        { $match: { brand: { $ne: null } } },
        { $group: { _id: '$brand', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, type: 'brand', value: '$_id' } }
      ]),
      Product.aggregate([
        { $match: { group_title: { $ne: null } } },
        { $group: { _id: '$group_title', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, type: 'group_title', value: '$_id' } }
      ]),
      Product.aggregate([
        { $match: { main_category: { $ne: null } } },
        { $group: { _id: '$main_category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, type: 'main_category', value: '$_id' } }
      ])
    ]);

    return NextResponse.json([
      ...popularBrands,
      ...popularGroups,
      ...popularCategories
    ]);
  }

  // Arama query'si varsa normal filtreli arama
  const regex = new RegExp(query, 'i');
  const result = await Product.aggregate([
    {
      $match: {
        $or: [
          { group_title: regex },
          { brand: regex },
          { main_category: regex },
          { subcategory: regex },
          { category_item: regex }
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
        category_item: 1
      }
    },
    { $limit: 10 }
  ]);

  return NextResponse.json(result);
}
