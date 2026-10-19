import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect nested /something subroutes (/something/licenses, /something/settings, etc.)
  // Root /something displays its own secure auth gate directly
  if (
    pathname.startsWith('/something/') &&
    !pathname.startsWith('/api/admin/auth')
  ) {
    const auth = req.cookies.get('dlims_admin_auth');
    if (!auth || auth.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/something', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/something/:path*'],
};
