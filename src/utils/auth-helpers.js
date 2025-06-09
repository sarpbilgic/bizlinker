// ✅ utils/auth-helpers.js
// Genişletilmiş token doğrulama araçları

import { authenticate } from '@/middleware/auth';
import { NextResponse } from 'next/server';

// GET: Kullanıcıyı request üzerinden alır. Kullanıcı yoksa hata fırlatır.
export async function getUserFromRequest(req) {
  const user = await authenticate(req);
  if (!user) throw new Error('Unauthorized');
  return user;
}

// Route'lara "middleware" gibi sarılarak erişimi sınırlar.
export function withAuth(handler) {
  return async (req, ...args) => {
    const user = await authenticate(req);
    if (!user) {
      console.warn(`[AUTH WARNING] Unauthorized access attempt to: ${req.url}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    req.user = user;
    return handler(req, ...args);
  };
} 