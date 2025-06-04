// GET /api/nearby?lat=35.1&lng=33.9&maxDistance=30000

import Product from '@/models/Product';
import Business from '@/models/Business';
import { NextResponse } from 'next/server';
import { withDB, errorResponse } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);

  const lat = parseFloat(searchParams.get('lat'));
  const lng = parseFloat(searchParams.get('lng'));
  const maxDistance = parseFloat(searchParams.get('maxDistance')) || 50000; // metre

  if (isNaN(lat) || isNaN(lng)) {
    return errorResponse('lat ve lng parametreleri zorunludur.', 400);
  }

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
