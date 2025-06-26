import { withDB, errorResponse } from '@/lib/api-utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import User from '@/models/User';
import { z } from 'zod';

// Get security settings
export const GET = withDB(async (req) => {
  try {
    const userData = authenticate(req);
    if (!userData) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await User.findById(userData.id).select('securitySettings');

    return NextResponse.json({
      success: true,
      settings: user.securitySettings || {
        twoFactorEnabled: false,
        loginNotifications: true,
        priceAlerts: true,
        stockAlerts: true,
        emailNotifications: true
      }
    });
  } catch (err) {
    console.error('GET SECURITY SETTINGS ERROR', err);
    return errorResponse('Internal Server Error', 500);
  }
});

// Update security settings
export const PUT = withDB(async (req) => {
  try {
    const userData = authenticate(req);
    if (!userData) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const schema = z.object({
      twoFactorEnabled: z.boolean().optional(),
      loginNotifications: z.boolean().optional(),
      priceAlerts: z.boolean().optional(),
      stockAlerts: z.boolean().optional(),
      emailNotifications: z.boolean().optional()
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors.map(err => err.message).join(', '), 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userData.id,
      { $set: { securitySettings: parsed.data } },
      { new: true }
    ).select('securitySettings');

    return NextResponse.json({
      success: true,
      settings: updatedUser.securitySettings
    });
  } catch (err) {
    console.error('UPDATE SECURITY SETTINGS ERROR', err);
    return errorResponse('Internal Server Error', 500);
  }
}); 