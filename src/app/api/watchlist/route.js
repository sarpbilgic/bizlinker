// ✅ src/app/api/watchlist/route.js
// Kullanıcının takip ettiği ürünleri listeler, ekler, çıkarır

import Watchlist from '@/models/Watchlist';
import { NextResponse } from 'next/server';
import { withDB } from '@/lib/api-utils';
import { withAuth } from '@/utils/auth-helpers';

// GET: Kullanıcının takip ettikleri
export const GET = withAuth(withDB(async (req) => {
  const user = req.user;
  const list = await Watchlist.find({ userId: user.id });
  return NextResponse.json({ data: list });
}));

// POST: Ürün takibe alınır
export const POST = withAuth(withDB(async (req) => {
  const user = req.user;
  const body = await req.json();
  const { group_slug } = body;

  if (!group_slug) {
    return NextResponse.json({ error: 'group_slug required' }, { status: 400 });
  }

  const exists = await Watchlist.findOne({ userId: user.id, group_slug });
  if (exists) {
    return NextResponse.json({ message: 'Already in watchlist' });
  }

  const item = await Watchlist.create({ userId: user.id, group_slug });
  return NextResponse.json({ success: true, item });
}));

// DELETE: Takipten çıkar
export const DELETE = withAuth(withDB(async (req) => {
  const user = req.user;
  const { searchParams } = new URL(req.url);
  const group_slug = searchParams.get('group_slug');

  if (!group_slug) {
    return NextResponse.json({ error: 'group_slug required' }, { status: 400 });
  }

  const deleted = await Watchlist.findOneAndDelete({ userId: user.id, group_slug });

  if (!deleted) {
    return NextResponse.json({ message: 'Not in watchlist' });
  }

  return NextResponse.json({ success: true });
}));
