import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Business from '@/models/Business';

export async function POST(req) {
  try {
    await connectMongo();
    const data = await req.json();

    const business = new Business(data);
    await business.save();

    return NextResponse.json({ message: 'Business created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Business creation error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
