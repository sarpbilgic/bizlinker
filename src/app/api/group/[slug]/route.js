import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getGroup } from '@/lib/group';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req, { params }) => {
  const slug = params.slug;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const { status, body } = await getGroup({ slug, id, Product });
  return NextResponse.json(body, { status });
});
