// ✅ Kullanıcı kimlik doğrulama API'si — cookie'deki token'a göre kullanıcı verisi döner.
// Frontend'de Navbar'da kullanıcıyı göstermek için veya auth kontrolü için kullanılır.

import User from '@/models/User';
import { NextResponse } from 'next/server';
import { withDB, errorResponse } from '@/lib/api-utils';
import { authenticate } from '@/middleware/auth';

export const GET = withDB(async (req) => {
  const user = authenticate(req);
  if (!user) {
    return errorResponse('Unauthorized', 401);
  }

  const userData = await User.findById(user.id).select('-password');
  if (!userData) {
    return errorResponse('User not found', 404);
  }

  return NextResponse.json(userData);
});
