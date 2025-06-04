import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getGroup } from '@/lib/group';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');

  const { status, body } = await getGroup({ slug, id, Product });
  return NextResponse.json(body, { status });
});
