import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  let query = {};
  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { group_title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ]
    };
  }

  const products = await Product.find(query).limit(100);
  return NextResponse.json(products);
} 