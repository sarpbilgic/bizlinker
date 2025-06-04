// src/app/api/group/route.js
// Belirtilen slug veya id ile ürün grubunu döner, isteğe bağlı benzer grupları ekler.

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';
import { formatGroup } from '@/lib/group';
import { authenticate } from '@/middleware/auth';

export const GET = withDB(async (req) => {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');
  const includeRelated = searchParams.get('includeRelated') === 'true';

  const query = slug ? { group_slug: slug } : id ? { group_id: id } : null;
  if (!query) {
    return NextResponse.json({ error: 'slug veya id gerekli.' }, { status: 400 });
  }

  const products = await Product.find(query).sort({ price: 1 });
  if (!products.length) {
    return NextResponse.json({ error: 'Ürün grubu bulunamadı.' }, { status: 404 });
  }

  const body = formatGroup(products);

  if (includeRelated) {
    const regex = new RegExp(body.group_title.split(' ').slice(0, 3).join('|'), 'i');
    const related = await Product.aggregate([
      { $match: { group_title: { $regex: regex }, group_slug: { $ne: body.group_slug } } },
      {
        $group: {
          _id: '$group_id',
          group_title: { $first: '$group_title' },
          group_slug: { $first: '$group_slug' },
          image: { $first: '$image' },
          minPrice: { $min: '$price' },
          count: { $sum: 1 }
        }
      },
      { $limit: 10 }
    ]);
    body.related_groups = related;
  }

  return NextResponse.json(body);
});
