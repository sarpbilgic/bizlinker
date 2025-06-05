// ✅ Yeni kullanıcı kaydı API'si — email, şifre ve userType ile kayıt.
// Frontend'deki register formundan çağrılır.

import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { withDB, errorResponse } from '@/lib/api-utils';
import { NextResponse } from 'next/server';

export const POST = withDB(async (req) => {
  try {
    const body = await req.json();

    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      userType: z.enum(['consumer', 'business']),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors, 400);
    }

    const { email, password, userType } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
      userType,
    });

    return NextResponse.json({ message: 'User created' }, { status: 201 });
  } catch (err) {
    console.error('REGISTER ERROR', err);
    return errorResponse('Internal Server Error', 500);
  }
});
