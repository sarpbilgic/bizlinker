///api/categories/route.js

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (type === 'menu') {
    const menu = await Product.aggregate([
      {
        $group: {
          _id: '$main_category',
          subcategories: { $addToSet: '$subcategory' }
        }
      },
      { $project: { _id: 0, main_category: '$_id', subcategories: 1 } }
    ]);
    return NextResponse.json(menu);
  }

  const categories = await Product.distinct('main_category');
  return NextResponse.json(categories);
});


