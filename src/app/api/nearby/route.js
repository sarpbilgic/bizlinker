// GET /api/nearby?lat=35.1&lng=33.9&maxDistance=30000

import Product from '@/models/Product';
import Business from '@/models/Business';
import { NextResponse } from 'next/server';
import { withDB, errorResponse } from '@/lib/api-utils';
import { z } from 'zod';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const params = Object.fromEntries(searchParams.entries());

  const schema = z.object({
    lat: z.preprocess((v) => parseFloat(v), z.number().finite()),
    lng: z.preprocess((v) => parseFloat(v), z.number().finite()),
    maxDistance: z
      .preprocess(
        (v) => (v === '' || v === undefined ? undefined : parseFloat(v)),
        z.number().finite()
      )
      .default(50000),
  });

  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors, 400);
  }

  const { lat, lng, maxDistance } = parsed.data;

  const nearbyBusinesses = await Business.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distance',
        spherical: true,
        maxDistance,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        distance: 1,
      },
    },
  ]);

  const businessIds = nearbyBusinesses.map(b => b._id);
  const businessDistances = Object.fromEntries(nearbyBusinesses.map(b => [b._id.toString(), b.distance]));

  const products = await Product.find({ business: { $in: businessIds } }).lean();

  // Mesafe ekle
  const result = products.map(p => ({
    ...p,
    distance_km: (businessDistances[p.business?.toString()] / 1000).toFixed(2),
  }));

  return NextResponse.json(result);
});
