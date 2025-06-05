// ✅ Kullanıcı çıkış API'si — cookie'deki token'ı temizler.
// Frontend'de Logout butonuna basıldığında çağrılır.

import { NextResponse } from 'next/server';

export const POST = async () => {
  const res = NextResponse.json({ success: true });
  res.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/"
  });
  return res;
};
