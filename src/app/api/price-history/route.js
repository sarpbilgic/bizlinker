import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { withDB, errorResponse } from '@/lib/api-utils';
import { z } from 'zod';

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const params = Object.fromEntries(searchParams.entries());

  // ✅ Sorgu validasyonu
  const schema = z.object({
    group_id: z.string().min(1),
    businessName: z.string().optional(),
    start: z.string().optional(), // ISO tarih
    end: z.string().optional(),   // ISO tarih
  });

  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors, 400);
  }

  const { group_id, businessName, start, end } = parsed.data;

  const match = {
    group_id,
  };

  if (businessName) {
    match.businessName = businessName;
  }

  if (start || end) {
    match.createdAt = {};
    if (start) match.createdAt.$gte = new Date(start);
    if (end) match.createdAt.$lte = new Date(end);
  }

  // ✅ Fiyat geçmişi sorgusu
  const history = await Product.find(match)
    .sort({ createdAt: 1 })
    .select('price businessName createdAt -_id');

  // ✅ Grafik için biçimlendirme
  const formatted = history.map(entry => ({
    price: entry.price,
    businessName: entry.businessName,
    date: entry.createdAt.toISOString().split('T')[0] // YYYY-MM-DD
  }));

  return NextResponse.json({ data: formatted });
});
