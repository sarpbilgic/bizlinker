// GET /api/business?name=Fıstık%20Bilgisayar

import { connectDB } from '@/lib/mongodb';
import Business from '@/models/Business';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'name parametresi gerekli.' }, { status: 400 });
  }

  const business = await Business.findOne({ name });
  if (!business) {
    return NextResponse.json({ error: 'İşletme bulunamadı.' }, { status: 404 });
  }

  const productCount = await Product.countDocuments({ businessName: name });

  return NextResponse.json({
    name: business.name,
    website: business.website,
    coordinates: business.location.coordinates,
    productCount
  });
}
