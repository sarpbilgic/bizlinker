import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getGroup } from '@/lib/group';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');

  const { status, body } = await getGroup({ slug, id, Product });
  return NextResponse.json(body, { status });
}
