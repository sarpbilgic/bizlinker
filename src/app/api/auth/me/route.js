// ✅ src/app/api/auth/me/route.js

import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
  try {
    await connectDB();
    const userData = authenticate(req);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(userData.id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error('ME ERROR', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
