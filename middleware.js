
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
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

  // ยังไม่ได้ Login
  if (!session && !isAuthPage && !isPublicPage) {
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)'
  ],
};
