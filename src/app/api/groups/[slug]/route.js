import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getGroup } from '@/lib/group';

export async function GET(req, { params }) {
  await connectDB();
  const slug = params.slug;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const { status, body } = await getGroup({ slug, id, Product });
  return NextResponse.json(body, { status });
}
