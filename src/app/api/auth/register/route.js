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
      name: z.string().min(1, "Name is required"),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors, 400);
    }

    const { name, email, password } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse('User already exists', 400);
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Registering user with email:', email);
    console.log('Salt rounds used:', saltRounds);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: 'User created' }, { status: 201 });
  } catch (err) {
    console.error('REGISTER ERROR', err);
    return errorResponse('Internal Server Error', 500);
  }
});
