import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, errorResponse, getPagination } from '@/lib/api-utils';

export const GET = withDB(async (req, { params }) => {
  const { searchParams } = new URL(req.url);
  const { slug } = params;

  if (!slug) {
    return errorResponse('slug parametresi gerekli', 400);
  }

  const { page, pageSize, skip, limit } = getPagination(searchParams);
  const [products, total] = await Promise.all([
    Product.find({ category_slug: slug }).sort({ price: 1 }).skip(skip).limit(limit),
    Product.countDocuments({ category_slug: slug })
  ]);
  return NextResponse.json({ data: products, total, page, pageSize });
});
