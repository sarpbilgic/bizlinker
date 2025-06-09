// ✅ src/app/api/brands/route.js
// Akakçe tarzı filtre yapısı için markaları listeler
// Aynı zamanda her markanın ürün sayısını döner

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';
import { getFiltersFromQuery } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const filters = getFiltersFromQuery(searchParams);

  const pipeline = [
    { $match: filters },
    { $group: {
      _id: '$brand',
      count: { $sum: 1 }
    }},
    { $sort: { count: -1 } },
    { $project: {
      name: '$_id',
      count: 1,
      _id: 0
    }}
  ];

  const brands = await Product.aggregate(pipeline);

  return NextResponse.json({
    data: brands,
    total: brands.length
  });
});
