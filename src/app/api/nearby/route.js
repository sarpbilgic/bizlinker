// ✅ src/app/api/nearby/route.js — Kullanıcının konumuna göre en yakın ürünleri listeleme

import Product from '@/models/Product';
import Business from '@/models/Business';
import { NextResponse } from 'next/server';
import { withDB, errorResponse, getPagination } from '@/lib/api-utils';
import { z } from 'zod';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip, limit } = getPagination(searchParams);
  const params = Object.fromEntries(searchParams.entries());

  const schema = z.object({
    lat: z.preprocess((v) => parseFloat(v), z.number().finite()),
    lng: z.preprocess((v) => parseFloat(v), z.number().finite()),
    maxDistance: z
      .preprocess((v) => (v === '' || v === undefined ? undefined : parseFloat(v)), z.number().finite())
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
  const businessDistances = Object.fromEntries(
    nearbyBusinesses.map(b => [b._id.toString(), b.distance])
  );

  const products = await Product.aggregate([
    { $match: { businessId: { $in: businessIds } } },
    {
      $group: {
        _id: '$group_id',
        group_title: { $first: '$group_title' },
        group_slug: { $first: '$group_slug' },
        image: { $first: '$image' },
        minPrice: { $min: '$price' },
        businesses: {
          $push: {
            businessName: '$businessName',
            businessId: '$businessId',
            price: '$price',
            productUrl: '$productUrl',
            image: '$image',
          },
        },
      },
    },
    { $sort: { minPrice: 1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const result = products.map(group => ({
    ...group,
    businesses: group.businesses.map(b => ({
      ...b,
      distance: businessDistances[b.businessId?.toString()] || null,
    })),
  }));

  return NextResponse.json({
    data: result,
    pagination: {
      page,
      pageSize,
      total: result.length,
    },
  });
});