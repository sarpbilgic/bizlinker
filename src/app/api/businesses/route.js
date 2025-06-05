// ✅ Frontend'de Kullanım Yeri:
// Kullanıcının konumuna yakın firmaları listelemek ve filtreleme yapmak için kullanılır.
// Örnek: "yakındaki firmalar", harita destekli firma listesi veya firma profilleri sayfasında.

import Business from '@/models/Business';
import { NextResponse } from 'next/server';
import { withDB, getPagination } from '@/lib/api-utils';
import { authenticate } from '@/middleware/auth';

export const GET = withDB(async (req) => {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip, limit } = getPagination(searchParams);

  const lat = parseFloat(searchParams.get('lat'));
  const lng = parseFloat(searchParams.get('lng'));
  const radius = parseFloat(searchParams.get('radius')) || 30; // kilometre cinsinden

  // Eğer konum verildiyse, yakın firmaları getir
  if (!isNaN(lat) && !isNaN(lng)) {
    const base = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          spherical: true,
          maxDistance: radius * 1000, // metre
        }
      }
    ];

    const totalRes = await Business.aggregate([...base, { $count: 'count' }]);
    const total = totalRes[0]?.count || 0;

    const businesses = await Business.aggregate([
      ...base,
      {
        $project: {
          _id: 0,
          name: 1,
          website: 1,
          distance: 1,
          coordinates: '$location.coordinates'
        }
      },
      { $skip: skip },
      { $limit: limit }
    ]);

    return NextResponse.json({ data: businesses, total, page, pageSize });
  }

  // Eğer konum verilmemişse tüm firmaları getir
  const [all, total] = await Promise.all([
    Business.find().skip(skip).limit(limit).select('name website location'),
    Business.countDocuments()
  ]);

  return NextResponse.json({ data: all, total, page, pageSize });
});
