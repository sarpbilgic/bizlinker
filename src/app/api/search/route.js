//api/search/route.js
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, getFiltersFromQuery, getPagination, errorResponse } from '@/lib/api-utils';
import { z } from 'zod';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);

  const params = Object.fromEntries(searchParams.entries());

  const schema = z.object({
    query: z.string().trim().optional(),
    min: z
      .preprocess(v => (v === undefined || v === '' ? undefined : parseFloat(v)), z.number().min(0))
      .optional(),
    max: z
      .preprocess(v => (v === undefined || v === '' ? undefined : parseFloat(v)), z.number().min(0))
      .optional(),
  });

  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors, 400);
  }

  const { query, min = 0, max = 999999 } = parsed.data;
  const filters = getFiltersFromQuery(searchParams);

  const match = {
    price: { $gte: min, $lte: max },
  };

  Object.assign(match, filters);
  if (query) {
    match.$or = [
      { name: { $regex: query, $options: 'i' } },
      { group_title: { $regex: query, $options: 'i' } },
      { group_slug: { $regex: query.replaceAll(' ', '-'), $options: 'i' } },
      { category_slug: { $regex: query.replaceAll(' ', '-'), $options: 'i' } }
    ];
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$group_id',
        group_title: { $first: '$group_title' },
        group_slug: { $first: '$group_slug' },
        image: { $first: '$image' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        brands: { $addToSet: '$brand' },
        count: { $sum: 1 },
        businesses: {
          $push: {
            businessName: '$businessName',
            price: '$price',
            productUrl: '$productUrl',
          },
        },
      },
    },
    { $sort: { minPrice: 1 } },
  ];

  const { page, pageSize, skip, limit } = getPagination(searchParams);
  const totalRes = await Product.aggregate([...pipeline, { $count: 'count' }]);
  const total = totalRes[0]?.count || 0;

  pipeline.push({ $skip: skip }, { $limit: limit });

  const results = await Product.aggregate(pipeline);
  return NextResponse.json({ data: results, total, page, pageSize });
});
