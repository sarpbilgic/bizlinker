// ✅ Frontend'de Kullanım Yeri:
// Ana sayfada kategorilere göre en ucuz ürün gruplarını bölümlü göstermek için
// kullanılır. Her kategori için belirli sayıda ürün grubu döner.

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, getPagination } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  // Her kategoriden kaç grup dönüleceği
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  // Kategori başına en ucuz ürün gruplarını çek
  const groups = await Product.aggregate([
    { $match: { group_id: { $ne: null } } },
    {
      $group: {
        _id: '$group_id',
        group_title: { $first: '$group_title' },
        group_slug: { $first: '$group_slug' },
        image: { $first: '$image' },
        price: { $min: '$price' },
        businessName: { $first: '$businessName' },
        category_slug: { $first: '$category_slug' },
        category_title: { $first: '$category_item' },
      }
    },
    { $sort: { price: 1 } }
  ]);

  const sectionsMap = new Map();
  for (const g of groups) {
    const slug = g.category_slug || 'other';
    const title = g.category_title || 'Diğer';
    if (!sectionsMap.has(slug)) {
      sectionsMap.set(slug, { categorySlug: slug, categoryTitle: title, groups: [] });
    }
    const section = sectionsMap.get(slug);
    if (section.groups.length < limit) {
      section.groups.push({
        title: g.group_title,
        slug: g.group_slug,
        image: g.image,
        price: g.price,
        businessName: g.businessName,
      });
    }
  }

  return NextResponse.json(Array.from(sectionsMap.values()));
});
