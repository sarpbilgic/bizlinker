import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '8', 10);

  // Verimlilik için ilk 300 ürünü limitle getir
  const grouped = await Product.aggregate([
    { $match: { group_id: { $ne: null } } },
    { $sort: { price: 1 } },
    { $limit: 300 },
    {
      $group: {
        _id: '$group_id',
        group_title: { $first: '$group_title' },
        group_slug: { $first: '$group_slug' },
        image: { $first: '$image' },
        minPrice: { $first: '$price' },
        businessName: { $first: '$businessName' },
        category_slug: { $first: '$category_slug' },
        category_item: { $first: '$category_item' },
        main_category: { $first: '$main_category' }
      }
    }
  ]);

  const categoryMap = new Map();

  for (const g of grouped) {
    const key = g.category_slug || 'diger';
    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        categorySlug: key,
        categoryTitle: g.category_item || 'Diğer',
        mainCategory: g.main_category || 'Genel',
        groups: []
      });
    }

    const section = categoryMap.get(key);
    if (section.groups.length < limit) {
      section.groups.push({
        title: g.group_title,
        slug: g.group_slug,
        image: g.image,
        price: g.minPrice,
        businessName: g.businessName
      });
    }
  }

  return NextResponse.json(Array.from(categoryMap.values()));
});
