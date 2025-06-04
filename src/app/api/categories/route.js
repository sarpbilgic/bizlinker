// src/app/api/categories/route.js
// Ürün kategorilerini hiyerarşik olarak döner, her düzeyde ürün sayısı içerir.

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const brand = searchParams.get('brand');
  const categorySlug = searchParams.get('category_slug');

  const match = {};
  if (brand) match.brand = brand;
  if (categorySlug) match.category_slug = categorySlug;

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: { main: '$main_category', sub: '$subcategory', item: '$category_item' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: { main: '$_id.main', sub: '$_id.sub' },
        items: { $push: { item: '$_id.item', count: '$count' } }
      }
    },
    {
      $group: {
        _id: '$_id.main',
        subcategories: { $push: { subcategory: '$_id.sub', items: '$items' } }
      }
    },
    {
      $project: { _id: 0, main_category: '$_id', subcategories: 1 }
    }
  ];

  const result = await Product.aggregate(pipeline);
  return NextResponse.json(result);
});
