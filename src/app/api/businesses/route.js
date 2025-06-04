// GET /api/businesses?lat=...&lng=...&radius=...

import Business from '@/models/Business';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);

  const lat = parseFloat(searchParams.get('lat'));
  const lng = parseFloat(searchParams.get('lng'));
  const radius = parseFloat(searchParams.get('radius')) || 30;

  if (!isNaN(lat) && !isNaN(lng)) {
    const businesses = await Business.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          spherical: true,
          maxDistance: radius * 1000,
        }
      },
      {
        $project: {
          _id: 0,
          name: 1,
          website: 1,
          distance: 1,
        }
      }
    ]);
    return NextResponse.json(businesses);
  }

  const all = await Business.find({}, { _id: 0, name: 1, website: 1 });
  return NextResponse.json(all);
});
