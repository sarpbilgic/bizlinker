// GET /api/recommendations?query=iphone&lat=35.1&lng=33.9

import Product from '@/models/Product';
import Business from '@/models/Business';
import { NextResponse } from 'next/server';
import { withDB, getPagination } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip, limit } = getPagination(searchParams);

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

  const [products, total] = await Promise.all([
    Product.find({ ...match, ...businessFilter })
      .skip(skip)
      .limit(limit)
      .select('group_title group_slug brand category_item price productUrl image'),
    Product.countDocuments({ ...match, ...businessFilter })
  ]);

  return NextResponse.json({ data: products, total, page, pageSize });
});
