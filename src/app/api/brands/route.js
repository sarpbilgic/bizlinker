// ✅ src/app/api/brands/route.js
// Akakçe tarzı filtre yapısı için markaları listeler
// Aynı zamanda her markanın ürün sayısını döner

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const mainCategory = searchParams.get('main_category');

  const match = {};
  if (mainCategory) {
    // Convert to regex pattern that matches both formats
    const searchPattern = mainCategory.replace(/-/g, '[- ]');
    match.main_category = { $regex: new RegExp(`^${searchPattern}$`, 'i') };
  }

  const pipeline = [
    { $match: match },
    { 
      $group: {
        _id: '$brand',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { 
      $project: {
        name: '$_id',
        count: 1,
        _id: 0
      }
    }
  ];

  const brands = await Product.aggregate(pipeline);

  return NextResponse.json({
    data: brands.filter(b => b.name),
    total: brands.length
  });
});
