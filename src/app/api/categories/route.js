import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const main = searchParams.get('main');
  const sub = searchParams.get('sub');
  const item = searchParams.get('item');
  const brand = searchParams.get('brand');

  const match = {
    main_category: { $exists: true, $ne: null },
    subcategory: { $exists: true, $ne: null },
    category_item: { $exists: true, $ne: null },
  };

  if (main) match.main_category = main;
  if (sub) match.subcategory = sub;
  if (item) match.category_item = item;
  if (brand) match.brand = brand;

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: {
          main: '$main_category',
          sub: '$subcategory',
          item: '$category_item',
          brand: '$brand',
        },
        count: { $sum: 1 },
      },
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
            brand: '$_id.brand',
            count: '$count'
          },
        },
      },
    },
    {
      $group: {
        _id: '$_id.main',
        subcategories: {
          $push: {
            subcategory: '$_id.sub',
            items: '$items'
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        main_category: '$_id',
        subcategories: 1,
      },
    },
  ];

  const result = await Product.aggregate(pipeline);
  return NextResponse.json(result);
}
