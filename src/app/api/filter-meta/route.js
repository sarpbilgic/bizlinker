// 📁 /api/filter-meta/route.js

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, getFiltersFromQuery } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const filters = getFiltersFromQuery(searchParams);

  const pipeline = [
    { $match: filters },
    {
      $facet: {
        brands: [
          { $match: { brand: { $exists: true, $ne: null } } },
          { $group: { _id: '$brand' } },
          { $project: { _id: 0, brand: '$_id' } }
        ],
        features: [
          { $match: { group_features: { $exists: true, $type: 'array', $ne: [] } } },
          { $unwind: '$group_features' },
          { $group: { _id: '$group_features', count: { $sum: 1 } } },
          { $project: { feature: '$_id', _id: 0, count: 1 } }
        ],
        priceRange: [
          { $group: {
              _id: null,
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' }
          }},
          { $project: { _id: 0, minPrice: 1, maxPrice: 1 } }
        ],
        businessCount: [
          { $group: { _id: '$businessName' } },
          { $count: 'count' }
        ]
      }
    }
  ];

  const result = await Product.aggregate(pipeline);
  const data = result[0];

  return NextResponse.json({
    brands: data.brands.map(b => b.brand),
    features: Object.values(
      data.features.reduce((acc, { feature }) => {
        if (!feature || !Array.isArray(feature)) return acc;
        feature.forEach(f => {
          acc[f] = acc[f] || { feature: f, values: [] };
          acc[f].values.push(f);
        });
        return acc;
      }, {})
    ),
    minPrice: data.priceRange[0]?.minPrice || 0,
    maxPrice: data.priceRange[0]?.maxPrice || 0,
    businessCount: data.businessCount[0]?.count || 0
  });
});
