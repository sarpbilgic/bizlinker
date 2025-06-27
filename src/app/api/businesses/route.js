// ✅ src/app/api/businesses/route.js — Konuma göre yakın işletmeleri listeleme

import Business from '@/models/Business';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';

export const GET = withDB(async () => {
  try {
    const businesses = await Business.find()
      .select('name website')
      .sort({ name: 1 });

    const total = await Business.countDocuments();

    return NextResponse.json({
      data: businesses,
      total,
      success: true
    });
  } catch (error) {
    console.error('Failed to fetch businesses:', error);
    return NextResponse.json({
      data: [],
      total: 0,
      success: false,
      error: 'Failed to fetch businesses'
    }, { status: 500 });
  }
});
