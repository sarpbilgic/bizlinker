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

    return NextResponse.json({ token });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return errorResponse('Internal server error', 500);
  }
});
