// ✅ /api/meta/route.js

import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectDB();

  const [brands, features, categories] = await Promise.all([
    Product.distinct('brand', { brand: { $ne: null } }),
    Product.aggregate([
      { $match: { group_features: { $exists: true, $not: { $size: 0 } } } },
      { $unwind: "$group_features" },
      { $group: { _id: "$group_features", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]),
    Product.aggregate([
      {
        $group: {
          _id: {
            main: "$main_category",
            sub: "$subcategory",
            item: "$category_item"
          }
        }
      },
      {
        $project: {
          _id: 0,
          main_category: "$_id.main",
          subcategory: "$_id.sub",
          category_item: "$_id.item"
        }
      }
    ])
  ]);

  return NextResponse.json({ brands, features, categories });
}
