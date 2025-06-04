// GET /api/businesses?lat=...&lng=...&radius=...

import Business from '@/models/Business';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';
import { authenticate } from '@/middleware/auth';

export const GET = withDB(async (req) => {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
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
          coordinates: '$location.coordinates'
        }
      }
    ]);
    return NextResponse.json(businesses);
  }

  const all = await Business.find({}, { _id: 0, name: 1, website: 1, 'location.coordinates': 1 });
  const mapped = all.map(b => ({
    name: b.name,
    website: b.website,
    coordinates: b.location.coordinates
  }));
  return NextResponse.json(mapped);
});
