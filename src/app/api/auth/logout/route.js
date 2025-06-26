// ✅ Kullanıcı çıkış API'si — cookie'deki token'ı temizler.
// Frontend'de Logout butonuna basıldığında çağrılır.

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const res = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Cookie'yi temizle
    res.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    return res;
  } catch (err) {
    console.error('LOGOUT ERROR', err);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
