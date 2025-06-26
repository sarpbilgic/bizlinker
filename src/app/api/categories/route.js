// ✅ src/app/api/categories/route.js
// 3 katmanlı hiyerarşik kategori verisi döner

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async () => {
  const products = await Product.find().select('main_category subcategory category_item');

  const tree = {};
  for (const p of products) {
    const main = p.main_category || 'Other';
    const sub = p.subcategory || 'Subcategory';
    const item = p.category_item || 'Category';

    if (!tree[main]) tree[main] = {};
    if (!tree[main][sub]) tree[main][sub] = new Set();
    tree[main][sub].add(item);
  }

  const result = Object.entries(tree).map(([main, subs]) => ({
    main,
    subs: Object.entries(subs).map(([sub, items]) => ({
      sub,
      items: Array.from(items)
    }))
  }));

  return NextResponse.json({ categories: result });
});
