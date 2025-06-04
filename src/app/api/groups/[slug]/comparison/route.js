// src/app/api/group/[slug]/comparison/route.js

import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(_, { params }) {
  await connectDB();
  const { slug } = params;

  const products = await Product.find({ group_slug: slug });

  if (!products.length) {
    return NextResponse.json({ error: 'Ürün grubu bulunamadı.' }, { status: 404 });
  }

  const response = {
    group_id: products[0].group_id,
    group_title: products[0].group_title,
    group_slug: products[0].group_slug,
    group_features: products[0].group_features || [],
    is_unique_group: products[0].is_unique_group || false,
    minPrice: Math.min(...products.map(p => p.price)),
    maxPrice: Math.max(...products.map(p => p.price)),
    brands: [...new Set(products.map(p => p.brand))],
    businesses: products.map(p => ({
      businessName: p.businessName,
      price: p.price,
      productUrl: p.productUrl,
      image: p.image,
      brand: p.brand,
    })),
    count: products.length
  };

  return NextResponse.json(response);
}
