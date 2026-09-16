import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import * as storage from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let item = await db.getLicenseById(params.id);
    if (!item) {
      item = storage.getLicenseById(params.id);
    }
    if (!item) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch {
    const item = storage.getLicenseById(params.id);
    if (!item) return NextResponse.json({ error: 'License not found' }, { status: 404 });
    return NextResponse.json(item);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let ok = false;
  try {
    ok = await db.deleteLicense(params.id);
  } catch {}
  const okStorage = storage.deleteLicense(params.id);
  if (!ok && !okStorage) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const licenseNumber = (body.license_number || body.dl_no || '').trim().toUpperCase();
  if (!licenseNumber) {
    return NextResponse.json({ error: 'License number is required' }, { status: 400 });
  }
  let rec: any = null;
  try {
    rec = await db.createOrUpdateLicense({ ...body, license_number: licenseNumber, id: params.id });
  } catch (e) {
    console.error('DB PUT error, falling back to storage:', e);
  }
  const storageRec = storage.createOrUpdateLicense({ ...body, license_number: licenseNumber, id: params.id });
  return NextResponse.json({ success: true, license: rec || storageRec });
}

