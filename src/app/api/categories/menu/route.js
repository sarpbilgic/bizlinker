import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Category from '@/models/Category';

export async function GET() {
  await mongoose.connect(process.env.MONGO_URI);

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
}
