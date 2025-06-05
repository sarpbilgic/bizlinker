// ✅ Frontend'de Kullanım Yeri:
// Arama kutusuna yazı yazıldığında autocomplete önerilerini göstermek için kullanılır.
// Öneriler grup başlığı, ürün adı ve marka bazlı döner.

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  // Sorgu boşsa boş sonuç dön
  if (!q || q.trim() === '') {
    return NextResponse.json({ suggestions: [] });
  }

  const regex = new RegExp(q.trim(), 'i');

  // Arama için ürünlerden başlık, isim ve marka alanlarında eşleşenleri getir
  const result = await Product.aggregate([
    {
      $match: {
        $or: [
          { group_title: regex },
          { name: regex },
          { brand: regex }
        ]
      }
    },
    {
      $project: {
        _id: 0,
        group_title: 1,
        name: 1,
        brand: 1
      }
    },
    { $limit: 20 }
  ]);

  // Tekil sonuçlar üret
  const unique = (arr) => [...new Set(arr.filter(Boolean))];
  const suggestions = {
    group_titles: unique(result.map(r => r.group_title)),
    product_names: unique(result.map(r => r.name)),
    brands: unique(result.map(r => r.brand))
  };

  return NextResponse.json(suggestions);
});
