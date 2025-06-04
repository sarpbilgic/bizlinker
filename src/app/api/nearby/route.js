// GET /api/nearby?lat=35.1&lng=33.9&radius=30

import Product from '@/models/Product';
import Business from '@/models/Business';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);

  const lat = parseFloat(searchParams.get('lat'));
  const lng = parseFloat(searchParams.get('lng'));
  const radius = parseFloat(searchParams.get('radius')) || 50; // km cinsinden

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat ve lng parametreleri zorunludur.' }, { status: 400 });
  }

  const nearbyBusinesses = await Business.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distance',
        spherical: true,
        maxDistance: radius * 1000, // metre cinsinden
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
