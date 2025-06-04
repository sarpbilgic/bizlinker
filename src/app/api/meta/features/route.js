//api/features/route.js
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectDB();

  const pipeline = [
    {
      $match: {
        group_features: { $exists: true, $ne: [], $type: 'array' }
      }
    },
    {
      $unwind: '$group_features'
    },
    {
      $group: {
        _id: '$group_features',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        feature: '$_id',
        count: 1
      }
    },
    { $sort: { count: -1 } }
  ];

  const result = await Product.aggregate(pipeline);
  return NextResponse.json(result);
}