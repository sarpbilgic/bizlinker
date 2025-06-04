import { connectDB } from '@/lib/mongodb';
import WatchlistItem from '@/models/WatchlistItem';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';

function getUserFromRequest(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const items = await WatchlistItem.find({ user: user.id || user._id }).lean();
  return NextResponse.json(items);
}

export async function POST(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { groupSlug } = await req.json();
  if (!groupSlug) {
    return NextResponse.json({ error: 'groupSlug required' }, { status: 400 });
  }

  await connectDB();
  const item = await WatchlistItem.findOneAndUpdate(
    { user: user.id || user._id, groupSlug },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { groupSlug } = await req.json();
  if (!groupSlug) {
    return NextResponse.json({ error: 'groupSlug required' }, { status: 400 });
  }

  await connectDB();
  await WatchlistItem.deleteOne({ user: user.id || user._id, groupSlug });
  return NextResponse.json({ message: 'Removed from watchlist' });
}
