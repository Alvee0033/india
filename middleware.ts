import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/admin/auth')) {
    const auth = req.cookies.get('dlims_admin_auth');
    if (!auth || auth.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
