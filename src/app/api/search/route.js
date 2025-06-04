//api/search/route.js
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, getFiltersFromQuery, getPagination } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get('query')?.toLowerCase();
  const filters = getFiltersFromQuery(searchParams);
  const min = parseFloat(searchParams.get('min')) || 0;
  const max = parseFloat(searchParams.get('max')) || 999999;

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
