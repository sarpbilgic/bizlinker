// ✅ src/app/api/profile/route.js

import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(req) {
  try {
    await connectDB();
    const userData = authenticate(req);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updatedFields = {};
    if (body.name) updatedFields.name = body.name;
    if (body.email) updatedFields.email = body.email;

    const updatedUser = await User.findByIdAndUpdate(
      userData.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error('PROFILE UPDATE ERROR', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
