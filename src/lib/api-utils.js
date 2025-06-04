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
    group_slug: 'group_slug',
    businessName: 'businessName'
  };
  Object.entries(map).forEach(([param, field]) => {
    const val = searchParams.get(param);
    if (val) filters[field] = val;
  });
  const min = parseFloat(searchParams.get('minPrice'));
  const max = parseFloat(searchParams.get('maxPrice'));
  if (!isNaN(min) || !isNaN(max)) {
    filters.price = {};
    if (!isNaN(min)) filters.price.$gte = min;
    if (!isNaN(max)) filters.price.$lte = max;
  }
  const q = searchParams.get('q');
  if (q) {
    filters.group_title = { $regex: q, $options: 'i' };
  }
  return filters;
}

import { connectDB } from './mongodb';
import { NextResponse } from 'next/server';

export function errorResponse(error, status = 500) {
  return NextResponse.json({ error }, { status });
}

export function withDB(handler) {
  return async (...args) => {
    try {
      await connectDB();
      return await handler(...args);
    } catch (err) {
      console.error(err);
      return errorResponse('Internal server error', 500);
    }
  };
}
