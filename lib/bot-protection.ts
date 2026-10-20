/**
 * Bot & Scraper Protection Utilities
 * Shared helpers used by middleware and API routes
 */

// Token bucket rate limiter stored in-memory (per process)
// Key: IP address, Value: { count, resetAt }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_PUBLIC_API = 20;    // max 20 requests/min per IP on public API
const RATE_LIMIT_PAGES = 60;         // max 60 page requests/min per IP

/**
 * Check if an IP has exceeded its rate limit.
 * Returns true if request should be blocked.
 */
export function isRateLimited(ip: string, limit: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > limit) {
    return true;
  }
  return false;
}

// Scrub stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitStore.entries()) {
    if (now > val.resetAt) rateLimitStore.delete(key);
  }
}, 5 * 60_000);

/**
 * Known bad bot / scraper / tool User-Agent substrings (lowercased).
 */
const BAD_UA_PATTERNS = [
  'python-requests',
  'python-urllib',
  'scrapy',
  'wget/',
  'libwww-perl',
  'go-http-client',
  'aiohttp',
  'httpx/',
  'mechanize',
  'scraperbot',
  'semrushbot',
  'ahrefsbot',
  'dotbot',
  'mj12bot',
  'blexbot',
  'petalbot',
  'sqlmap',
  'nikto',
  'masscan',
  'zgrab',
  'nuclei',
  'dirbuster',
  'nmap',
  'curl/', // plain curl (not browsers)
  'node-fetch',
  'axios/',
  'okhttp',
];

/**
 * Returns true if the User-Agent looks like a bot/scraper tool.
 */
export function isBotUserAgent(ua: string | null): boolean {
  if (!ua || ua.trim() === '') return true; // empty UA = bot
  const lower = ua.toLowerCase();
  return BAD_UA_PATTERNS.some((p) => lower.includes(p));
}

/**
 * Returns true if the request looks like it came from a real browser.
 * Checks the presence of browser-specific Sec-Fetch headers.
 */
export function hasBrowserFingerprint(headers: Headers): boolean {
  // Real browsers send these Fetch metadata headers
  const secFetchSite = headers.get('sec-fetch-site');
  const secFetchMode = headers.get('sec-fetch-mode');
  // Allow if either header is present (browsers always send them)
  return !!(secFetchSite || secFetchMode);
}

/**
 * Returns true if the Referer header comes from the same site.
 */
export function hasSiteReferer(headers: Headers): boolean {
  const referer = headers.get('referer') || '';
  return referer.includes('sarathiparivahn.com') || referer === '';
}

/**
 * Get a clean client IP from Next.js request headers.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    '0.0.0.0'
  );
}

export { RATE_LIMIT_PUBLIC_API, RATE_LIMIT_PAGES };
