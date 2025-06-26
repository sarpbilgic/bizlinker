import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const category_slug = searchParams.get('category_slug');

  if (!category_slug) {
    return NextResponse.json({ error: 'Category slug is required' }, { status: 400 });
  }

  // Get all products in the category
  const products = await Product.find({ category_slug });

  // Extract unique brands and businesses
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  const businesses = [...new Set(products.map(p => p.businessName).filter(Boolean))];

  // Get price range
  const prices = products.map(p => p.price).filter(Boolean);
  const priceRange = prices.length ? {
    min: Math.min(...prices),
    max: Math.max(...prices)
  } : { min: 0, max: 0 };

  // Get common features if they exist
  const features = [...new Set(products.flatMap(p => p.group_features || []))];

  return NextResponse.json({
    data: {
      brands,
      businesses,
      priceRange,
      features,
      total: products.length
    }
  });
}); 