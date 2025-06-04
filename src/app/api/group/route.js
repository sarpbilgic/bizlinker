// src/app/api/group/route.js
// Belirtilen slug veya id ile ürün grubunu döner, isteğe bağlı benzer grupları ekler.

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, errorResponse } from '@/lib/api-utils';
import { z } from 'zod';
import { formatGroup } from '@/lib/group';
import { authenticate } from '@/middleware/auth';

export const GET = withDB(async (req) => {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const params = Object.fromEntries(searchParams.entries());

  const schema = z
    .object({
      slug: z.string().optional(),
      id: z.string().optional(),
      includeRelated: z
        .preprocess((v) => (v === undefined ? undefined : v === 'true'), z.boolean())
        .optional(),
    })
    .refine((d) => d.slug || d.id, { message: 'slug veya id gerekli.' });

  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors, 400);
  }
  const { slug, id, includeRelated = false } = parsed.data;

  const query = slug ? { group_slug: slug } : { group_id: id };

  const products = await Product.find(query).sort({ price: 1 });
  if (!products.length) {
    return errorResponse('Ürün grubu bulunamadı.', 404);
  }

  const body = formatGroup(products);

  if (includeRelated) {
    const regex = new RegExp(body.group_title.split(' ').slice(0, 3).join('|'), 'i');
    const related = await Product.aggregate([
      { $match: { group_title: { $regex: regex }, group_slug: { $ne: body.group_slug } } },
      {
        $group: {
          _id: '$group_id',
          group_title: { $first: '$group_title' },
          group_slug: { $first: '$group_slug' },
          image: { $first: '$image' },
          minPrice: { $min: '$price' },
          count: { $sum: 1 }
        }
      },
      { $limit: 10 }
    ]);
    body.related_groups = related;
  }

  return NextResponse.json(body);
});
