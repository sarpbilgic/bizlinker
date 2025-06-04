import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (_, { params }) => {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ error: 'slug parametresi gerekli' }, { status: 400 });
  }

  const products = await Product.find({ category_slug: slug }).sort({ price: 1 });
  return NextResponse.json(products);
});
