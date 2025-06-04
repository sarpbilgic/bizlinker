export function getFiltersFromQuery(searchParams) {
  const filters = {};
  const map = {
    main: 'main_category',
    main_category: 'main_category',
    sub: 'subcategory',
    subcategory: 'subcategory',
    item: 'category_item',
    category_item: 'category_item',
    brand: 'brand',
    category_slug: 'category_slug',
    group_slug: 'group_slug'
  };
  Object.entries(map).forEach(([param, field]) => {
    const val = searchParams.get(param);
    if (val) filters[field] = val;
  });
  const q = searchParams.get('q');
  if (q) {
    filters.group_title = { $regex: q, $options: 'i' };
  }
  return filters;
}

import { connectDB } from './mongodb';
import { NextResponse } from 'next/server';

export function withDB(handler) {
  return async (...args) => {
    try {
      await connectDB();
      return await handler(...args);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
