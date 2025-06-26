import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { withDB, errorResponse } from '@/lib/api-utils';
import { NextResponse } from 'next/server';

export const PUT = withDB(async (req) => {
  try {
    // Cookie'den token'ı al
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    // Token'ı verify et
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return errorResponse('Invalid token', 401);
    }

    const body = await req.json();

    // Input validation
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Valid email is required"),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors.map(err => err.message).join(', '), 400);
    }

    const { name, email } = parsed.data;

    // Email değişikliği varsa, başka kullanıcı tarafından kullanılıp kullanılmadığını kontrol et
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: decoded.id } 
    });
    
    if (existingUser) {
      return errorResponse('This email address is already in use by another user', 400);
    }

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { name, email },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return errorResponse('User not found', 404);
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    });

  } catch (err) {
    console.error('UPDATE PROFILE ERROR', err);
    return errorResponse('Internal Server Error', 500);
  }
}); 