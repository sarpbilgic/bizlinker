import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { withDB, errorResponse } from '@/lib/api-utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';

export const POST = withDB(async (req) => {
  try {
    const userData = authenticate(req);
    if (!userData) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();

    // Input validation
    const schema = z.object({
      currentPassword: z.string().min(6, "Current password is required"),
      newPassword: z.string().min(6, "New password must be at least 6 characters"),
      confirmPassword: z.string().min(6, "Confirm password is required")
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"]
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors.map(err => err.message).join(', '), 400);
    }

    const { currentPassword, newPassword } = parsed.data;

    // Get user with password
    const user = await User.findById(userData.id);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return errorResponse('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userData.id, { password: hashedPassword });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('CHANGE PASSWORD ERROR', err);
    return errorResponse('Internal Server Error', 500);
  }
}); 