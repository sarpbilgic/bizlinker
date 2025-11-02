// ✅ Frontend'de Kullanım Yeri:
// Ana kategori sayfalarında (örneğin: Bilgisayarlar) filtreli olarak ürün gruplarını göstermek için kullanılır.
// Örnek: /category/bilgisayar → filtreye göre ürün gruplarını çeker.

// ✅ src/app/api/grouped-products/route.js
// Ürünleri gruplandırarak listeler (örneğin: aynı modelin farklı satıcıları)

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, getPagination, getFiltersFromQuery } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const { skip, limit, page, pageSize } = getPagination(searchParams);
  const filters = getFiltersFromQuery(searchParams);

  // Make sure we only get products with group_id
  const matchStage = {
    ...filters,
    group_id: { $exists: true, $ne: null }
  };

  // First, get total count
  const totalRes = await Product.aggregate([
    { $match: matchStage },
    { $group: { _id: '$group_id' } },
    { $count: 'total' }
  ]);
  const total = totalRes[0]?.total || 0;

  // Then get the grouped products
  const groups = await Product.aggregate([
    { $match: matchStage },
    { $sort: { price: 1 } },
    { 
      $group: {
        _id: '$group_id',
        group_title: { $first: '$group_title' },
        group_slug: { $first: '$group_slug' },
        group_features: { $first: '$group_features' },
        category_slug: { $first: '$category_slug' },
        category_item: { $first: '$category_item' },
        image: { $first: '$image' },
        brands: { $addToSet: '$brand' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' },
        totalProducts: { $sum: 1 },
        businesses: {
          $push: {
            businessName: '$businessName',
            businessUrl: '$businessUrl',
            brand: '$brand',
            price: '$price',
            productUrl: '$productUrl',
            image: '$image',
            createdAt: '$createdAt',
            location: '$location'
          }
        }
      }
    },
    // Add best offer
    {
      $addFields: {
        best_offer: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$businesses',
                as: 'business',
                cond: { $eq: ['$$business.price', '$minPrice'] }
              }
            },
            0
          ]
        }
      }
    },
    // Sort by minPrice
    { $sort: { minPrice: 1 } },
    { $skip: skip },
    { $limit: limit }
  ]);

  return NextResponse.json({
    data: groups,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
});