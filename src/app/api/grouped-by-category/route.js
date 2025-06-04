
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, errorResponse } from '@/lib/api-utils';
import { z } from 'zod';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const params = Object.fromEntries(searchParams.entries());

  const schema = z.object({
    limit: z
      .preprocess(v => (v === undefined || v === '' ? undefined : parseInt(v, 10)), z.number().int().positive())
      .optional()
  });

  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors, 400);
  }

  const { limit = 5 } = parsed.data;

  const categories = await Product.aggregate([
    {
      $group: {
        _id: "$category_slug",
        categoryTitle: { $first: "$main_category" },
        groups: {
          $push: {
            _id: "$group_id",
            title: "$group_title_simplified",
            slug: "$group_slug",
            image: "$image",
            price: "$price",
            count: 1,
            businessName: "$businessName",
          }
        }
      }
    },
    { $limit: limit }
  ]);

  return NextResponse.json(categories);
});
