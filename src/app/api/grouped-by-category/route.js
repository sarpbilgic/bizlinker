import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const main = searchParams.get('main');
  const limit = parseInt(searchParams.get('limit')) || 10;

  const match = {};
  if (main) {
    // Convert to regex pattern that matches both formats
    const searchPattern = main.replace(/-/g, '[- ]');
    match.main_category = { $regex: new RegExp(`^${searchPattern}$`, 'i') };
  }

  const grouped = await Product.aggregate([
    { $match: match },
    { $sort: { price: 1, createdAt: -1 } },
    { $limit: 500 },
    {
      $group: {
        _id: '$group_id',
        group_title: { $first: '$group_title' },
        group_slug: { $first: '$group_slug' },
        image: { $first: '$image' },
        minPrice: { $first: '$price' },
        maxPrice: { $max: '$price' },
        businessName: { $first: '$businessName' },
        businessUrl: { $first: '$businessUrl' },
        productUrl: { $first: '$productUrl' },
        category_slug: { $first: '$category_slug' },
        category_item: { $first: '$category_item' },
        main_category: { $first: '$main_category' },
        brand: { $first: '$brand' },
        productCount: { $sum: 1 },
        priceRange: {
          $push: {
            business: '$businessName',
            price: '$price'
          }
        }
      }
    },
    {
      $addFields: {
        savings: { $subtract: ['$maxPrice', '$minPrice'] },
        savingsPercent: {
          $cond: {
            if: { $gt: ['$maxPrice', 0] },
            then: { 
              $multiply: [
                { $divide: [{ $subtract: ['$maxPrice', '$minPrice'] }, '$maxPrice'] },
                100
              ]
            },
            else: 0
          }
        }
      }
    },
    { $sort: { minPrice: 1 } }
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
        maxPrice: g.maxPrice,
        businessName: g.businessName,
        businessUrl: g.businessUrl,
        productUrl: g.productUrl,
        brand: g.brand,
        productCount: g.productCount,
        savings: g.savings,
        savingsPercent: Math.round(g.savingsPercent),
        priceRange: g.priceRange
      });
    }
  }

  // Sort categories by product count and filter for at least 3 products
  const sortedCategories = Array.from(categoryMap.values())
    .sort((a, b) => b.groups.length - a.groups.length)
    .filter(category => category.groups.length >= 3);

  return NextResponse.json(sortedCategories);
});
