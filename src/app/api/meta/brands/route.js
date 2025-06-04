//api/brands/route.js
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectDB();

  const pipeline = [
    {
      $match: {
        brand: { $exists: true, $ne: null },
        main_category: { $exists: true, $ne: null },
        subcategory: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: {
          main: '$main_category',
          sub: '$subcategory',
          brand: '$brand',
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: {
          main: '$_id.main',
          sub: '$_id.sub',
        },
        brands: {
          $push: {
            brand: '$_id.brand',
            count: '$count',
          },
        },
      },
    },
    {
      $group: {
        _id: '$_id.main',
        subcategories: {
          $push: {
            subcategory: '$_id.sub',
            brands: '$brands',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        main_category: '$_id',
        subcategories: 1,
      },
    },
  ];

  const result = await Product.aggregate(pipeline);
  return NextResponse.json(result);
}
