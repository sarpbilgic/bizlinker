// GET /api/groups?main=&sub=&item=&brand=&category_slug=&group_slug=&q=&sort=&lat=&lng=&radius=

import Product from '@/models/Product';
import Business from '@/models/Business';
import { NextResponse } from 'next/server';
import { withDB, getFiltersFromQuery } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);

  // FİLTRELER
  const filters = getFiltersFromQuery(searchParams);

  // SIRALAMA
  const sort = searchParams.get('sort');
  let sortStage = {};
  if (sort === 'minPrice_asc') sortStage = { minPrice: 1 };
  if (sort === 'maxPrice_desc') sortStage = { maxPrice: -1 };
  if (sort === 'count_desc') sortStage = { count: -1 };

  // KONUM FİLTRESİ
  const lat = parseFloat(searchParams.get('lat'));
  const lng = parseFloat(searchParams.get('lng'));
  const radius = parseFloat(searchParams.get('radius')) || 30; // km

  const geoEnabled = !isNaN(lat) && !isNaN(lng);

  // AGGREGATION PIPELINE
  const pipeline = [];

  if (geoEnabled) {
    pipeline.push(
      {
        $lookup: {
          from: 'businesses',
          localField: 'businessName',
          foreignField: 'name',
          as: 'businessData'
        }
      },
      { $unwind: '$businessData' },
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          spherical: true,
          maxDistance: radius * 1000,
          query: {
            ...filters,
            group_id: { $ne: null }
          }
        }
      }
    );
  } else {
    pipeline.push({ $match: { group_id: { $ne: null }, ...filters } });
  }

  pipeline.push(
    {
      $group: {
        _id: '$group_id',
        group_title: { $first: '$group_title' },
        group_slug: { $first: '$group_slug' },
        image: { $first: '$image' },
        brands: { $addToSet: '$brand' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        count: { $sum: 1 },
        businesses: {
          $push: {
            businessName: '$businessName',
            price: '$price',
            productUrl: '$productUrl',
            image: '$image',
            ...(geoEnabled && { distance: '$distance' })
          }
        }
      }
    },
    { $sort: Object.keys(sortStage).length ? sortStage : { minPrice: 1 } },
    { $limit: 100 }
  );

  const result = await Product.aggregate(pipeline);
  return NextResponse.json(result);
});
