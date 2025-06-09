// ✅ src/app/api/search/route.js (Gelişmiş versiyon — Akakçe tarzı gruplama destekli)

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getFiltersFromQuery, getPagination, errorResponse } from '@/lib/api-utils';
import { z } from 'zod';

export async function GET(req) {
  try {
    await connectDB();
    const searchParams = new URL(req.url).searchParams;
    const params = Object.fromEntries(searchParams.entries());

    // ✅ Zod ile arama parametreleri doğrulama
    const schema = z.object({
      query: z.string().trim().optional(),
      min: z
        .preprocess(v => (v === undefined || v === '' ? undefined : parseFloat(v)), z.number().min(0))
        .optional(),
      max: z
        .preprocess(v => (v === undefined || v === '' ? undefined : parseFloat(v)), z.number().min(0))
        .optional(),
    });

    const parsed = schema.safeParse(params);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors, 400);
    }

    const { query, min = 0, max = 999999 } = parsed.data;
    const filters = getFiltersFromQuery(searchParams);

    const match = {
      price: { $gte: min, $lte: max },
      ...filters,
    };

    if (query) {
      match.$or = [
        { name: { $regex: query, $options: 'i' } },
        { group_title: { $regex: query, $options: 'i' } },
        { group_slug: { $regex: query.replaceAll(' ', '-'), $options: 'i' } },
        { category_slug: { $regex: query.replaceAll(' ', '-'), $options: 'i' } },
      ];
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: '$group_id',
          group_title: { $first: '$group_title' },
          group_slug: { $first: '$group_slug' },
          group_title_simplified: { $first: '$group_title_simplified' },
          category_slug: { $first: '$category_slug' },
          category_item: { $first: '$category_item' },
          image: { $first: '$image' },
          group_features: { $first: '$group_features' },
          is_unique_group: { $first: '$is_unique_group' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          brands: { $addToSet: '$brand' },
          count: { $sum: 1 },
          businesses: {
            $push: {
              businessName: '$businessName',
              businessUrl: '$businessUrl',
              price: '$price',
              productUrl: '$productUrl',
              image: '$image',
              createdAt: '$createdAt',
              brand: '$brand',
            },
          },
        },
      },
    ];

    const { page, pageSize, skip, limit } = getPagination(searchParams);
    const totalRes = await Product.aggregate([...pipeline, { $count: 'count' }]);
    const total = totalRes[0]?.count || 0;

    pipeline.push(
      { $sort: { minPrice: 1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const data = await Product.aggregate(pipeline);

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        total,
      },
    });
  } catch (err) {
    console.error('SEARCH ERROR', err);
    return errorResponse('Internal Server Error');
  }
}
