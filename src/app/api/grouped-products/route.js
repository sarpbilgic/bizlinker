// ✅ Frontend'de Kullanım Yeri:
// Ana kategori sayfalarında (örneğin: Bilgisayarlar) filtreli olarak ürün gruplarını göstermek için kullanılır.
// Örnek: /category/bilgisayar → filtreye göre ürün gruplarını çeker.

// ✅ src/app/api/grouped-products/route.js
// Ürünleri gruplandırarak listeler (örneğin: aynı modelin farklı satıcıları)

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, getPagination, getFiltersFromQuery } from '@/lib/api-utils';
import { formatGroup } from '@/lib/group';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const { skip, limit, page, pageSize } = getPagination(searchParams);
  const filters = getFiltersFromQuery(searchParams);

  const groups = await Product.aggregate([
    { $match: filters },
    { $sort: { price: 1 } },
    { $group: {
      _id: '$group_slug',
      docs: { $push: '$$ROOT' }
    }},
    { $skip: skip },
    { $limit: limit }
  ]);

  const formatted = groups.map(g => formatGroup(g.docs));

  return NextResponse.json({
    data: formatted,
    pagination: {
      page,
      pageSize,
      total: formatted.length,
      totalPages: Math.ceil(formatted.length / pageSize)
    }
  });
});







/*import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, getFiltersFromQuery, getPagination } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);

  // URL'den filtreleri al (kategoriSlug, subCategorySlug, brand, businessName, vs.)
  const filters = getFiltersFromQuery(searchParams);

  // Sıralama aşaması
  let sortStage = {};
  const sort = searchParams.get('sort');
  if (sort === 'minPrice_asc') sortStage = { minPrice: 1 };
  else if (sort === 'maxPrice_desc') sortStage = { maxPrice: -1 };
  else if (sort === 'count_desc') sortStage = { count: -1 };
  else sortStage = { minPrice: 1 }; // varsayılan

  // Aggregation pipeline başlangıcı
  const pipeline = [
    { $match: { group_id: { $ne: null }, ...filters } }
  ];

  // Ürünleri grup bazında topla
  pipeline.push({
    $group: {
      _id: '$group_id',
      group_title: { $first: '$group_title' },
      group_slug: { $first: '$group_slug' },
      image: { $first: '$image' },
      brands: { $addToSet: '$brand' },
      minPrice: { $min: '$price' },
      maxPrice: { $max: '$price' },
      count: { $sum: 1 },
      businesses: {
        $push: {
          businessName: '$businessName',
          price: '$price',
          productUrl: '$productUrl'
        }
      }
    }
  });

  // Pagination
  const { page, pageSize, skip, limit } = getPagination(searchParams);
  const totalRes = await Product.aggregate([...pipeline, { $count: 'count' }]);
  const total = totalRes[0]?.count || 0;

  // Sıralama ve sayfalama
  pipeline.push(
    { $sort: sortStage },
    { $skip: skip },
    { $limit: limit }
  );

  const groups = await Product.aggregate(pipeline);

  return NextResponse.json({
    data: groups,
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      total
    }
  });
});
*/