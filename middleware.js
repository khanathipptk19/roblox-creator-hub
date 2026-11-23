import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. ปล่อยผ่านไฟล์รูปภาพและไฟล์ Static ทุกชนิด (เช่น .png, .jpg, .svg, .webp, .ico)
  if (/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get('session')?.value;
  let session = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.AUTH_SECRET)
      );
      session = payload;
    } catch {
      session = null;
    }
  }

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register';

  // หน้าแรกเปิดให้เข้าถึงได้โดยไม่ต้อง Login
  const isPublicPage = pathname === '/';

  // 2. (เผื่อไว้) ถ้าหน้าแรกมีการเรียก API เพื่อดึงข้อมูลสาธารณะ ให้เพิ่ม Path API ตรงนี้
  const isPublicApi = pathname.startsWith('/api/public'); // แก้ชื่อ Path ให้ตรงกับ API หน้าแรกของคุณ (ถ้ามี)

  // ยังไม่ได้ Login
  if (!session && !isAuthPage && !isPublicPage && !isPublicApi) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.redirect(
      new URL('/login', req.url)
    );
  }

  // Login แล้วไม่ต้องกลับหน้า Login/Register
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // ตรวจสอบสิทธิ์ Admin
  if (
    (pathname.startsWith('/admin') ||
      pathname.startsWith('/api/admin')) &&
    session?.role !== 'admin'
  ) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  // 3. ยกเว้นไฟล์นามสกุลรูปภาพตั้งแต่ระดับ matcher เพื่อไม่ต้องรัน middleware ให้เสียเวลา
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)'
  ],
};