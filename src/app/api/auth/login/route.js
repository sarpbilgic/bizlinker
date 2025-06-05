// ✅ Kullanıcı giriş API'si — token HTTP-only cookie olarak yazılır.
// Frontend'de login formundan sonra çağrılır. Token cookie'de saklanır.

import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { withDB, errorResponse } from '@/lib/api-utils';
import { NextResponse } from 'next/server';

export const POST = withDB(async (req) => {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return errorResponse('Email and password required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse('Invalid password', 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in env');
    }

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const res = NextResponse.json({ success: true });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/"
    });

    return res;
  } catch (err) {
    console.error('LOGIN ERROR', err);
    return errorResponse('Internal Server Error', 500);
  }
});
