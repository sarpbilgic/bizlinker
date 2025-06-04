// ✅ /api/products/route.js

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, getFiltersFromQuery, errorResponse, getPagination } from '@/lib/api-utils';
import { z } from 'zod';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const params = Object.fromEntries(searchParams.entries());

  const schema = z.object({
    id: z.string().optional(),
    main: z.string().optional(),
    sub: z.string().optional(),
    item: z.string().optional(),
    brand: z.string().optional(),
    category_slug: z.string().optional(),
    group_slug: z.string().optional(),
    q: z.string().optional(),
    minPrice: z
      .preprocess(
        (v) => (v === '' || v === undefined ? undefined : parseFloat(v)),
        z.number().finite()
      )
      .optional(),
    maxPrice: z
      .preprocess(
        (v) => (v === '' || v === undefined ? undefined : parseFloat(v)),
        z.number().finite()
      )
      .optional(),
  });

  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors, 400);
  }

  const { id } = parsed.data;

  if (id) {
    const product = await Product.findById(id);
    return product ? NextResponse.json(product) : errorResponse('Product not found', 404);
  }

  const filters = getFiltersFromQuery(new URLSearchParams(params));
  const { page, pageSize, skip, limit } = getPagination(searchParams);
  const [products, total] = await Promise.all([
    Product.find(filters).skip(skip).limit(limit),
    Product.countDocuments(filters)
  ]);
  return NextResponse.json({ data: products, total, page, pageSize });
});
