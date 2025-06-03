// src/app/api/related-groups/route.js

import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'slug parametresi gerekli.' }, { status: 400 });
  }

  const baseProduct = await Product.findOne({ group_slug: slug });

  if (!baseProduct) {
    return NextResponse.json({ error: 'Grup bulunamadı.' }, { status: 404 });
  }

  const regex = new RegExp(baseProduct.group_title.split(' ').slice(0, 3).join('|'), 'i');

  const similarGroups = await Product.aggregate([
    { $match: { group_title: { $regex: regex }, group_slug: { $ne: slug } } },
    {
      $group: {
        _id: '$group_id',
        group_title: { $first: '$group_title' },
        group_slug: { $first: '$group_slug' },
        image: { $first: '$image' },
        minPrice: { $min: '$price' },
        count: { $sum: 1 }
      }
    },
    { $limit: 10 }
  ]);

  return NextResponse.json(similarGroups);
}
