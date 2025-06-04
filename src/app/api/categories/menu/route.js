import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async () => {

  const categories = await Category.find();

  const structured = {};

  // Kategorileri gruplandır
  for (const cat of categories) {
    if (!structured[cat.main]) {
      structured[cat.main] = {};
    }
    if (!structured[cat.main][cat.sub || 'Genel']) {
      structured[cat.main][cat.sub || 'Genel'] = [];
    }
    structured[cat.main][cat.sub || 'Genel'].push(cat.item);
  }

  // Dizi haline getir
  const result = Object.entries(structured).map(([main, subs]) => ({
    main,
    subs: Object.entries(subs).map(([sub, items]) => ({
      sub,
      items
    }))
  }));

  return NextResponse.json(result);
});
