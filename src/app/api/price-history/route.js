// ✅ Frontend'de Kullanım Yeri:
// Bir ürün detay sayfasında (örnek: MacBook Pro) geçmiş fiyat değişim grafiği göstermek için kullanılır.
// /group/:slug sayfasında fiyat trendi çizimi (örneğin: Chart.js ile) için uygundur.

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, errorResponse } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('group_slug');

  if (!slug) {
    return errorResponse('group_slug gerekli.', 400);
  }

  // Belirtilen gruba ait tüm ürünlerin fiyat geçmişini gruplandır
  const pipeline = [
    { $match: { group_slug: slug } },

    // Tarih ve firma bazında fiyat özetleri
    {
      $group: {
        _id: {
          business: '$businessName',
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' }
      }
    },

    // Her firma için günlük fiyat geçmişi oluştur
    {
      $group: {
        _id: '$_id.business',
        history: {
          $push: {
            date: '$_id.date',
            minPrice: '$minPrice',
            maxPrice: '$maxPrice',
            avgPrice: '$avgPrice'
          }
        }
      }
    },

    {
      $project: {
        _id: 0,
        business: '$_id',
        history: 1
      }
    }
  ];

  const result = await Product.aggregate(pipeline);
  return NextResponse.json(result);
});
