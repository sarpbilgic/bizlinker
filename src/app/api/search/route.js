//api/search/route.js
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const query = searchParams.get('query')?.toLowerCase();
  const main = searchParams.get('main');
  const sub = searchParams.get('sub');
  const item = searchParams.get('item');
  const brand = searchParams.get('brand');
  const min = parseFloat(searchParams.get('min')) || 0;
  const max = parseFloat(searchParams.get('max')) || 999999;

  const match = {
    price: { $gte: min, $lte: max },
  };

  if (main) match.main_category = main;
  if (sub) match.subcategory = sub;
  if (item) match.category_item = item;
  if (brand) match.brand = brand;
  if (query) {
    match.$or = [
      { name: { $regex: query, $options: 'i' } },
      { group_title: { $regex: query, $options: 'i' } },
      { group_slug: { $regex: query.replaceAll(' ', '-'), $options: 'i' } },
      { category_slug: { $regex: query.replaceAll(' ', '-'), $options: 'i' } }
    ];
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$group_id',
        group_title: { $first: '$group_title' },
        group_slug: { $first: '$group_slug' },
        image: { $first: '$image' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        brands: { $addToSet: '$brand' },
        count: { $sum: 1 },
        businesses: {
          $push: {
            businessName: '$businessName',
            price: '$price',
            productUrl: '$productUrl',
          },
        },
      },
    },
    { $sort: { minPrice: 1 } },
  ];

  const results = await Product.aggregate(pipeline);
  return NextResponse.json(results);
}
