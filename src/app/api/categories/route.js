// ✅ src/app/api/categories/route.js
// 3 katmanlı hiyerarşik kategori verisi döner

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async () => {
  // Use aggregation to get unique category combinations efficiently
  const categories = await Product.aggregate([
    {
      $group: {
        _id: {
          main: { $ifNull: ['$main_category', 'Other'] },
          sub: { $ifNull: ['$subcategory', 'Subcategory'] },
          item: { $ifNull: ['$category_item', 'Category'] }
        }
      }
    },
    {
      $group: {
        _id: '$_id.main',
        subs: {
          $addToSet: {
            sub: '$_id.sub',
            item: '$_id.item'
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Transform aggregation result to nested structure
  const result = categories.map(mainCat => {
    const subsMap = new Map();
    
    mainCat.subs.forEach(({ sub, item }) => {
      if (!subsMap.has(sub)) {
        subsMap.set(sub, new Set());
      }
      subsMap.get(sub).add(item);
    });

    return {
      main: mainCat._id,
      subs: Array.from(subsMap.entries()).map(([sub, items]) => ({
        sub,
        items: Array.from(items).sort()
      })).sort((a, b) => a.sub.localeCompare(b.sub))
    };
  });

  return NextResponse.json({ categories: result });
});
