// GET /api/price-history?group_slug=...

import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('group_slug');

  if (!slug) {
    return NextResponse.json({ error: 'group_slug gerekli.' }, { status: 400 });
  }

  const pipeline = [
    { $match: { group_slug: slug } },
    {
      $group: {
        _id: { business: '$businessName', date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' }
      }
    },
    {
      $group: {
        _id: '$_id.business',
        history: {
          $push: {
            date: '$_id.date',
            minPrice: '$minPrice',
            maxPrice: '$maxPrice',
            avgPrice: '$avgPrice'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        business: '$_id',
        history: 1
      }
    }
  ];

  const result = await Product.aggregate(pipeline);
  return NextResponse.json(result);
}
