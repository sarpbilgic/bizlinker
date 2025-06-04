// GET /api/price-history?group_slug=...

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, errorResponse } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('group_slug');

  if (!slug) {
    return errorResponse('group_slug gerekli.', 400);
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
});
