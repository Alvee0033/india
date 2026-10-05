import { NextRequest, NextResponse } from 'next/server';
import { findLicenseForVerification as findInDb } from '@/lib/db';
import { findLicenseForVerification as findInJson } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const license = searchParams.get('license') || searchParams.get('dl_number') || searchParams.get('verify') || '';
    const dob = searchParams.get('dob') || searchParams.get('dateofbirth') || '';

    if (!license.trim()) {
      return NextResponse.json({ success: false, error: 'Driving Licence Number is required.' }, { status: 400 });
    }

    let record = null;
    try {
      record = await findInDb({ license: license.trim(), dob: dob.trim() });
    } catch (e) {
      // Fallback to json storage if database is unavailable
      record = findInJson({ license: license.trim(), dob: dob.trim() });
    }

    if (!record) {
      record = findInJson({ license: license.trim(), dob: dob.trim() });
    }

    if (!record) {
      return NextResponse.json({ success: false, error: 'No record found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const license = body.license || body.dl_number || body.license_number || body.txtverify || '';
    const dob = body.dob || body.dateofbirth || '';

    if (!license.trim()) {
      return NextResponse.json({ success: false, error: 'Driving Licence Number is required.' }, { status: 400 });
    }

    let record = null;
    try {
      record = await findInDb({ license: license.trim(), dob: dob.trim() });
    } catch (e) {
      record = findInJson({ license: license.trim(), dob: dob.trim() });
    }

    if (!record) {
      record = findInJson({ license: license.trim(), dob: dob.trim() });
    }

    if (!record) {
      return NextResponse.json({ success: false, error: 'No record found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
