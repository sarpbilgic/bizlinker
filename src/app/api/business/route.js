// GET /api/business?name=Fıstık%20Bilgisayar

import Business from '@/models/Business';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
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
});
