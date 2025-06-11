import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const distinctMainCategories = await Product.distinct('main_category');
  
  return NextResponse.json({
    main_categories: distinctMainCategories,
    total: distinctMainCategories.length
  });
}); 