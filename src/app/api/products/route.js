// ✅ Gelişmiş ürün grubu listesi (fiyat karşılaştırma için uygun)

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, getFiltersFromQuery, getPagination } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const filters = getFiltersFromQuery(searchParams);
  const { page, pageSize, skip, limit } = getPagination(searchParams);

  const sort = searchParams.get('sort');
  let sortField = 'minPrice';
  let sortOrder = 1;

  if (sort === 'price_desc') sortOrder = -1;
  else if (sort === 'createdAt_desc') {
    sortField = 'latest';
    sortOrder = -1;
  }

  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$group_id',
        group_title: { $first: '$group_title' },
        group_slug: { $first: '$group_slug' },
        image: { $first: '$image' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        brands: { $addToSet: '$brand' },
        latest: { $max: '$createdAt' },
        count: { $sum: 1 },
        businesses: {
          $push: {
            businessName: '$businessName',
            price: '$price',
            productUrl: '$productUrl',
            brand: '$brand',
            createdAt: '$createdAt'
          }
        }
      }
    },
    { $sort: { [sortField]: sortOrder } },
    { $skip: skip },
    { $limit: limit }
  ];

  const totalGroups = await Product.aggregate([
    { $match: filters },
    { $group: { _id: '$group_id' } },
    { $count: 'total' }
  ]);

  const total = totalGroups[0]?.total || 0;
  const results = await Product.aggregate(pipeline);

  // İşletmeleri en ucuzdan sırala
  const grouped = results.map(group => ({
    ...group,
    cheapest: group.businesses.reduce((min, b) => b.price < min.price ? b : min, group.businesses[0]),
    businesses: group.businesses.sort((a, b) => a.price - b.price)
  }));

  return NextResponse.json({
    data: grouped,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
});
