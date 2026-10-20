import { NextRequest, NextResponse } from 'next/server';
import { findLicenseForVerification as findInDb } from '@/lib/db';
import { findLicenseForVerification as findInJson } from '@/lib/storage';
import { isBotUserAgent, getClientIp, isRateLimited, RATE_LIMIT_PUBLIC_API } from '@/lib/bot-protection';

export const dynamic = 'force-dynamic';

/**
 * Anti-bot guard for public API routes.
 * Returns a NextResponse error if the request looks like a bot/scraper,
 * or null if the request should proceed.
 */
function botGuard(request: NextRequest): NextResponse | null {
  const headers = request.headers;
  const ua = headers.get('user-agent') || '';
  const ip = getClientIp(headers);

  // 1. Block known scraper User-Agents
  if (isBotUserAgent(ua)) {
    // Return a fake 200 with empty data to confuse bots (not a 403 they can detect)
    return NextResponse.json({ success: false, error: 'No record found' }, { status: 404 });
  }

  // 2. Rate limit: 20 requests per minute per IP
  if (isRateLimited(`verify:${ip}`, RATE_LIMIT_PUBLIC_API)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': '60' },
      }
    );
  }

  // 3. Honeypot: if request body has the _hp field filled, it's a bot
  // (checked per-handler for POST requests)
  return null;
}

async function lookupLicense(license: string, dob: string) {
  let record = null;
  try {
    record = await findInDb({ license: license.trim(), dob: dob.trim() });
  } catch {
    record = findInJson({ license: license.trim(), dob: dob.trim() });
  }
  if (!record) {
    record = findInJson({ license: license.trim(), dob: dob.trim() });
  }
  return record;
}

export async function GET(request: NextRequest) {
  const guard = botGuard(request);
  if (guard) return guard;

  try {
    const { searchParams } = new URL(request.url);
    const license = searchParams.get('license') || searchParams.get('dl_number') || searchParams.get('verify') || '';
    const dob = searchParams.get('dob') || searchParams.get('dateofbirth') || '';

    if (!license.trim()) {
      return NextResponse.json({ success: false, error: 'Driving Licence Number is required.' }, { status: 400 });
    }

    const record = await lookupLicense(license, dob);
    if (!record) {
      return NextResponse.json({ success: false, error: 'No record found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = botGuard(request);
  if (guard) return guard;

  try {
    const body = await request.json();

    // Honeypot field: bots fill all fields including hidden ones
    // If _hp (hidden honeypot) is present and non-empty, it's a bot
    if (body._hp && body._hp.trim() !== '') {
      // Silently return fake success to confuse the bot
      return NextResponse.json({ success: false, error: 'No record found' }, { status: 404 });
    }

    const license = body.license || body.dl_number || body.license_number || body.txtverify || '';
    const dob = body.dob || body.dateofbirth || '';

    if (!license.trim()) {
      return NextResponse.json({ success: false, error: 'Driving Licence Number is required.' }, { status: 400 });
    }

    const record = await lookupLicense(license, dob);
    if (!record) {
      return NextResponse.json({ success: false, error: 'No record found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
