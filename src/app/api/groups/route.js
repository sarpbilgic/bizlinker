// GET /api/groups?main=&sub=&item=&brand=&category_slug=&group_slug=&q=&sort=&lat=&lng=&radius=

import Product from '@/models/Product';
import Business from '@/models/Business';
import { NextResponse } from 'next/server';
import { withDB, getFiltersFromQuery, errorResponse } from '@/lib/api-utils';
import { z } from 'zod';
import { authenticate } from '@/middleware/auth';

export const GET = withDB(async (req) => {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const params = Object.fromEntries(searchParams.entries());

  const schema = z.object({
    main: z.string().optional(),
    sub: z.string().optional(),
    item: z.string().optional(),
    brand: z.string().optional(),
    category_slug: z.string().optional(),
    group_slug: z.string().optional(),
    q: z.string().optional(),
    sort: z.enum(['minPrice_asc', 'maxPrice_desc', 'count_desc']).optional(),
    lat: z
      .preprocess(
        (v) => (v === '' || v === undefined ? undefined : parseFloat(v)),
        z.number().finite()
      )
      .optional(),
    lng: z
      .preprocess(
        (v) => (v === '' || v === undefined ? undefined : parseFloat(v)),
        z.number().finite()
      )
      .optional(),
    radius: z
      .preprocess(
        (v) => (v === '' || v === undefined ? undefined : parseFloat(v)),
        z.number().finite()
      )
      .default(30),
  });

  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors, 400);
  }
  const { sort, lat, lng, radius } = parsed.data;

  // FİLTRELER
  const filters = getFiltersFromQuery(new URLSearchParams(params));

  // SIRALAMA
  let sortStage = {};
  if (sort === 'minPrice_asc') sortStage = { minPrice: 1 };
  if (sort === 'maxPrice_desc') sortStage = { maxPrice: -1 };
  if (sort === 'count_desc') sortStage = { count: -1 };

  // KONUM FİLTRESİ
  const geoEnabled = typeof lat === 'number' && typeof lng === 'number';

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
