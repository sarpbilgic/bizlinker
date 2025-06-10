// ✅ src/app/api/auth/login/route.js

import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { withDB, errorResponse } from '@/lib/api-utils';
import { NextResponse } from 'next/server';

export const POST = withDB(async (req) => {
  try {
    const { email, password } = await req.json();
    console.log('Login attempt for email:', email);
    
    if (!email || !password) {
      return errorResponse('Email and password required', 400);
    }

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return errorResponse('Geçersiz email veya şifre', 401); // Generic error message
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return errorResponse('Geçersiz email veya şifre', 401); // Generic error message
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in env');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const res = NextResponse.json({
      success: true,
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        isAdmin: user.isAdmin 
      },
    });
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return res;
  } catch (err) {
    console.error('LOGIN ERROR', err);
    return errorResponse('Internal Server Error', 500);
  }
});
