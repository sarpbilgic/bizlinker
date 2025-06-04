import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(_, { params }) {
  await connectDB();
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ error: 'slug parametresi gerekli' }, { status: 400 });
  }

  const products = await Product.find({ category_slug: slug }).sort({ price: 1 });
  return NextResponse.json(products);
}
