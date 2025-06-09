// ✅ Ürün detay sayfası için ürün grubu verisi
// Route: /api/group/[slug]

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, errorResponse } from '@/lib/api-utils';
import { formatGroup } from '@/lib/group';

export const GET = withDB(async (req, { params }) => {
  const slug = params.slug;

  if (!slug) {
    return errorResponse('Ürün slug gerekli.', 400);
  }

  // Ürün grubunu getir
  const products = await Product.find({ group_slug: slug }).sort({ price: 1 });
  if (!products.length) {
    return errorResponse('Ürün grubu bulunamadı.', 404);
  }

  const body = formatGroup(products);

  // Benzer ürün grupları da getir (isteğe bağlı)
  const regex = new RegExp(body.group_title.split(' ').slice(0, 2).join('|'), 'i');
  const related = await Product.aggregate([
    { $match: { group_title: { $regex: regex }, group_slug: { $ne: slug } } },
    {
      $group: {
        _id: '$group_id',
        group_title: { $first: '$group_title' },
        group_slug: { $first: '$group_slug' },
        image: { $first: '$image' },
        minPrice: { $min: '$price' }
      }
    },
    { $sort: { minPrice: 1 } },
    { $limit: 8 }
  ]);

  body.related = related;

  return NextResponse.json(body);
});
