// ✅ /api/products/route.js

import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const id = searchParams.get('id');
  if (id) {
    const product = await Product.findById(id);
    return product
      ? NextResponse.json(product)
      : NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const filters = {};
  ['main_category', 'subcategory', 'category_item', 'brand', 'category_slug', 'group_slug'].forEach((key) => {
    const val = searchParams.get(key);
    if (val) filters[key] = val;
  });

  const products = await Product.find(filters).limit(100);
  return NextResponse.json(products);
}
