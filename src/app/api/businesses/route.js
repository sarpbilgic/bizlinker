// ✅ src/app/api/businesses/route.js — Konuma göre yakın işletmeleri listeleme

import Business from '@/models/Business';
import { NextResponse } from 'next/server';
import { withDB, getPagination, errorResponse } from '@/lib/api-utils';
import { z } from 'zod';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip, limit } = getPagination(searchParams);
  const params = Object.fromEntries(searchParams.entries());

  const schema = z.object({
    lat: z.preprocess((v) => parseFloat(v), z.number().finite().optional()),
    lng: z.preprocess((v) => parseFloat(v), z.number().finite().optional()),
    radius: z
      .preprocess((v) => (v === '' || v === undefined ? undefined : parseFloat(v)), z.number().finite())
      .default(30),
  });

  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors, 400);
  }

  const { lat, lng, radius } = parsed.data;

  if (lat !== undefined && lng !== undefined) {
    const base = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          spherical: true,
          maxDistance: radius * 1000,
        },
      },
    ];

    const totalRes = await Business.aggregate([...base, { $count: 'count' }]);
    const total = totalRes[0]?.count || 0;

    const businesses = await Business.aggregate([
      ...base,
      {
        $project: {
          _id: 0,
          name: 1,
          website: 1,
          distance: 1,
          coordinates: '$location.coordinates',
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    return NextResponse.json({ data: businesses, total, page, pageSize });
  }

  const [all, total] = await Promise.all([
    Business.find().skip(skip).limit(limit).select('name website location'),
    Business.countDocuments(),
  ]);

  return NextResponse.json({ data: all, total, page, pageSize });
});
