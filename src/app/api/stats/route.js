// src/app/api/stats/route.js

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async () => {

  const [totalProducts, uniqueGroups, businesses, brands] = await Promise.all([
    Product.countDocuments(),
    Product.distinct('group_id'),
    Product.distinct('businessName'),
    Product.distinct('brand')
  ]);

  return NextResponse.json({
    totalProducts,
    uniqueGroups: uniqueGroups.length,
    businessCount: businesses.length,
    brandCount: brands.length
  });
});
