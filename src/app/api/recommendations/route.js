// GET /api/recommendations?query=iphone&lat=35.1&lng=33.9

import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Business from '@/models/Business';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const q = searchParams.get('query') || '';
  const lat = parseFloat(searchParams.get('lat'));
  const lng = parseFloat(searchParams.get('lng'));

  const match = {
    $or: [
      { group_title: { $regex: q, $options: 'i' } },
      { brand: { $regex: q, $options: 'i' } },
      { category_item: { $regex: q, $options: 'i' } },
      { subcategory: { $regex: q, $options: 'i' } },
    ]
  };

  let businessFilter = {};
  if (!isNaN(lat) && !isNaN(lng)) {
    const radiusInKm = 50 / 6371; // ~50km yarıçap
    const businesses = await Business.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], radiusInKm] } }
    });

    const ids = businesses.map(b => b._id.toString());
    if (ids.length > 0) businessFilter.business = { $in: ids };
  }

  const products = await Product.find({ ...match, ...businessFilter })
    .limit(20)
    .select('group_title group_slug brand category_item price productUrl image');

  return NextResponse.json(products);
}
