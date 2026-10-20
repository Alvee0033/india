import { NextRequest, NextResponse } from 'next/server';
import { isBotUserAgent, hasBrowserFingerprint, getClientIp, isRateLimited, RATE_LIMIT_PAGES } from '@/lib/bot-protection';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const headers = req.headers;
  const ua = headers.get('user-agent') || '';
  const ip = getClientIp(headers);

  // ─── Bot Protection: Skip for static assets & internal Next.js routes ───
  const isStaticOrInternal =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/public/') ||
    /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|css|js|map)$/.test(pathname);

  if (!isStaticOrInternal) {
    // 1. Block known scraper/bot User-Agents on ALL routes
    if (isBotUserAgent(ua)) {
      // Return a convincing fake response to confuse automated scrapers
      // (instead of 403, which they know to handle)
      return new NextResponse(
        '<!DOCTYPE html><html><head><title>503 Service Unavailable</title></head><body>Service temporarily unavailable. Please try again later.</body></html>',
        {
          status: 503,
          headers: {
            'Content-Type': 'text/html',
            'Retry-After': '300',
            'X-Robots-Tag': 'noindex, nofollow',
          },
        }
      );
    }

    // 2. Rate limit page requests (60/min per IP)
    if (isRateLimited(`page:${ip}`, RATE_LIMIT_PAGES)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please slow down.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // ─── Admin Route Protection ───────────────────────────────────────────────
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
  matcher: [
    // Apply to all routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
