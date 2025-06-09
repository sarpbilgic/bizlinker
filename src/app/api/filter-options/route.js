// ✅ src/app/api/products/filter-options/route.js
// Geliştirilmiş filtre opsiyonları API'si
// - Marka, alt kategori, işletme isimleri döner
// - Temizlenmiş ve normalize edilmiş veri döndürür

import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async () => {
  const allProducts = await Product.find({}, {
    brand: 1,
    category_item: 1,
    businessName: 1
  });

  const clean = (arr) => [
    ...new Set(
      arr.filter(Boolean)
         .map(i => i.trim())
         .filter(i => i.length > 1 && !/^(\d+mm|\d+tb|ssd|mousepad|diğer|null)$/i.test(i))
         .map(i => i.toLowerCase())
         .map(i => i.charAt(0).toUpperCase() + i.slice(1))
    )
  ];

  const brands = clean(allProducts.map(p => p.brand));
  const subcategories = clean(allProducts.map(p => p.category_item));

  return NextResponse.json({
    filters: {
      brands,
      subcategories,
      businessNames
    },
    counts: {
      totalProducts: allProducts.length,
      distinctBrands: brands.length,
      distinctBusinesses: businessNames.length
    }
  });
});
