// GET /api/filters
// Açıklama: Tüm filtre verilerini (kategori hiyerarşisi, markalar, özellikler) tek JSON içinde döner.

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async () => {

  // ✅ Kategori Hiyerarşisi
  const categoryPipeline = [
    {
      $group: {
        _id: {
          main: '$main_category',
          sub: '$subcategory',
          item: '$category_item',
          slug: '$category_slug'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: {
          main: '$_id.main',
          sub: '$_id.sub'
        },
        items: {
          $addToSet: {
            item: '$_id.item',
            slug: '$_id.slug',
            count: '$count'
          }
        }
      }
    },
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
    {
      $project: {
        _id: 0,
        main_category: '$_id',
        subcategories: 1
      }
    }
  ];

  const categories = await Product.aggregate(categoryPipeline);

  // ✅ Markalar
  const brands = await Product.distinct('brand', { brand: { $ne: null } });

  // ✅ Özellikler
  const features = await Product.aggregate([
    { $match: { group_features: { $exists: true, $ne: [] } } },
    { $unwind: '$group_features' },
    { $match: { 'group_features': { $type: 'string' } } },
    {
      $group: {
        _id: '$group_features',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 50 }, // en yaygın 50 özelliği döndür
    {
      $project: {
        _id: 0,
        feature: '$_id',
        count: 1
      }
    }
  ]);

  return NextResponse.json({
    categories,
    brands,
    features
  });
});
