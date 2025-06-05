// ✅ Frontend'de Kullanım Yeri:
// Arama filtreleri (ana kategori, alt kategori, ürün tipi) gösterilirken kullanılır.
// Örnek: /search veya /category/... sayfalarında kategori seçeneklerini çekmek için

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const brand = searchParams.get('brand');
  const categorySlug = searchParams.get('category_slug');

  const match = {};
  if (brand) match.brand = brand;
  if (categorySlug) match.category_slug = categorySlug;

  const pipeline = [
    { $match: match },

    // 1. Ürünleri main/sub/item düzeyinde gruplarız ve sayarız
    {
      $group: {
        _id: {
          main: '$main_category',
          sub: '$subcategory',
          item: '$category_item'
        },
        count: { $sum: 1 }
      }
    },

    // 2. Her subcategory altında item'ları grupla
    {
      $group: {
        _id: {
          main: '$_id.main',
          sub: '$_id.sub'
        },
        items: {
          $push: {
            item: '$_id.item',
            count: '$count'
          }
        }
      }
    },

    // 3. Her main_category altında subcategory'leri grupla
    {
      $group: {
        _id: '$_id.main',
        subcategories: {
          $push: {
            subcategory: '$_id.sub',
            items: '$items'
          }
        }
      }
    },

    // 4. Son hali düzenle
    {
      $project: {
        _id: 0,
        main_category: '$_id',
        subcategories: 1
      }
    }
  ];

  const result = await Product.aggregate(pipeline);
  return NextResponse.json(result);
});
