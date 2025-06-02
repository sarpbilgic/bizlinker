//api/group/[slug]/route.js
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  await connectDB();

  const slug = params.slug;

  if (!slug) {
    return NextResponse.json({ error: 'group_slug parametresi zorunludur' }, { status: 400 });
  }

  const products = await Product.find({ group_slug: slug }).sort({ price: 1 });

  if (!products || products.length === 0) {
    return NextResponse.json({ error: 'Gruba ait ürün bulunamadı' }, { status: 404 });
  }

  const base = products[0];

  const result = {
    group_slug: slug,
    group_title: base.group_title,
    category_slug: base.category_slug,
    category_item: base.category_item,
    brand_set: [...new Set(products.map(p => p.brand).filter(Boolean))],
    min_price: Math.min(...products.map(p => p.price)),
    max_price: Math.max(...products.map(p => p.price)),
    businesses: products.map(p => ({
      businessName: p.businessName,
      businessUrl: p.businessUrl,
      price: p.price,
      productUrl: p.productUrl,
      image: p.image,
      createdAt: p.createdAt,
    }))
  };

  return NextResponse.json(result);
}
