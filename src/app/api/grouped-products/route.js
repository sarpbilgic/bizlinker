import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  // Filtreleri al
  const filters = {};
  if (searchParams.get('main')) filters.main_category = searchParams.get('main');
  if (searchParams.get('sub')) filters.subcategory = searchParams.get('sub');
  if (searchParams.get('item')) filters.category_item = searchParams.get('item');
  if (searchParams.get('brand')) filters.brand = searchParams.get('brand');
  if (searchParams.get('category_slug')) filters.category_slug = searchParams.get('category_slug');
  if (searchParams.get('group_slug')) filters.group_slug = searchParams.get('group_slug');
  if (searchParams.get('q')) filters.group_title = { $regex: searchParams.get('q'), $options: 'i' };

  let sortStage = {};
  const sort = searchParams.get('sort');

  
  if (sort === 'minPrice_asc') sortStage = { minPrice: 1 };
  else if (sort === 'maxPrice_desc') sortStage = { maxPrice: -1 };
  else if (sort === 'count_desc') sortStage = { count: -1 };
  else sortStage = { count: -1 }; // varsayılan

  // Aggregation pipeline
  const pipeline = [
    { $match: { group_id: { $ne: null }, ...filters } },
    {
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
    },
    ...(Object.keys(sortStage).length > 0 ? [{ $sort: sortStage }] : []),
    { $limit: 100 }
  ];

  const result = await Product.aggregate(pipeline);
  return NextResponse.json(result);
}