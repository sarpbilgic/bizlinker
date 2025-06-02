// GET /api/group?slug=group_slug_here OR ?id=group_id

import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');

  const query = slug ? { group_slug: slug } : id ? { group_id: id } : null;

  if (!query) {
    return NextResponse.json({ error: 'slug veya id parametresi gerekli.' }, { status: 400 });
  }

  const products = await Product.find(query);

  if (!products.length) {
    return NextResponse.json({ error: 'Ürün grubu bulunamadı.' }, { status: 404 });
  }

  const group = {
    group_id: products[0].group_id,
    group_title: products[0].group_title,
    group_slug: products[0].group_slug,
    group_title_simplified: products[0].group_title_simplified,
    image: products[0].image || '/no-image.png',
    group_features: products[0].group_features || [],
    is_unique_group: products[0].is_unique_group || false,
    minPrice: Math.min(...products.map(p => p.price)),
    maxPrice: Math.max(...products.map(p => p.price)),
    brands: [...new Set(products.map(p => p.brand))],
    businesses: products
      .map(p => ({
        businessName: p.businessName,
        price: p.price,
        productUrl: p.productUrl,
        image: p.image,
      }))
      .sort((a, b) => a.price - b.price),
    count: products.length
  };

  return NextResponse.json(group);
}