// ✅ /api/products/route.js

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, getFiltersFromQuery } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get('id');
  if (id) {
    const product = await Product.findById(id);
    return product
      ? NextResponse.json(product)
      : NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const filters = getFiltersFromQuery(searchParams);

  const products = await Product.find(filters).limit(100);
  return NextResponse.json(products);
});
