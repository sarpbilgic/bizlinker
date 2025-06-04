// src/app/api/products/[id]/route.js

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (_, { params }) => {
  const { id } = params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: 'Geçersiz ID veya sunucu hatası.' }, { status: 400 });
  }
});
