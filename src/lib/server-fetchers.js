// lib/server-fetchers.js
import Product from '@/models/Product';
import Category from '@/models/Category';
import Brand from '@/models/Brand';
import dbConnect from './dbConnect';

// Ana kategorileri getir (Navbar icin)
export async function getCategories() {
  await dbConnect();
  const cats = await Category.find({}).lean();
  return cats;
}

// Footer verilerini getir: en fazla urunu olan brand, ana kategori, subkategori
export async function getFooterData() {
  await dbConnect();

  const [brands, categories, subcategories] = await Promise.all([
    Product.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          slug: { $toLower: '$brand' },
          name: '$_id',
        },
      },
    ]),
    Product.aggregate([
      { $group: { _id: '$category_item', count: { $sum: 1 }, slug: { $first: '$category_slug' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          slug: '$slug',
          name: '$_id',
        },
      },
    ]),
    Product.aggregate([
      { $group: { _id: '$subcategory_item', count: { $sum: 1 }, slug: { $first: '$subcategory_slug' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          slug: '$slug',
          name: '$_id',
        },
      },
    ])
  ]);

  return {
    brands,
    categories,
    subcategories
  };
}
