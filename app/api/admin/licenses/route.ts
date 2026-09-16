import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { pool, ensureSchema } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    await ensureSchema(client);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = 'SELECT * FROM licenses WHERE 1=1';
    const params: any[] = [];

    if (search) {
      params.push(`%${search.toUpperCase()}%`);
      query += ` AND (UPPER(license_number) LIKE $${params.length} OR UPPER(name) LIKE $${params.length})`;
    }
    if (status !== 'ALL') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    query += ` ORDER BY created_at DESC LIMIT ${limit}`;

    const result = await client.query(query, params);
    const countResult = await client.query('SELECT COUNT(*) as count FROM licenses');

    return NextResponse.json({
      licenses: result.rows,
      pagination: { total: parseInt(countResult.rows[0].count) },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    await ensureSchema(client);
    const body = await req.json();

    const licenseNumber = (body.license_number || body.dl_no || '').trim().toUpperCase();
    if (!licenseNumber) {
      return NextResponse.json({ error: 'License number is required' }, { status: 400 });
    }

    // Handle photo: if base64 provided, store it directly as data URL
    let photoUrl = body.photo_url || null;
    if (body.photo_base64 && body.photo_base64.startsWith('data:')) {
      photoUrl = body.photo_base64;
    }

    let sigUrl = body.signature_url || body.signature_base64 || null;
    if (body.holder_sig_base64 && body.holder_sig_base64.startsWith('data:')) {
      sigUrl = body.holder_sig_base64;
    }

    let authSigUrl = body.auth_signature_url || body.auth_sig_base64 || null;
    if (body.auth_sig_base64 && body.auth_sig_base64.startsWith('data:')) {
      authSigUrl = body.auth_sig_base64;
    }

    const saved = await db.createOrUpdateLicense({
      ...body,
      license_number: licenseNumber,
      photo_url: photoUrl,
      signature_url: sigUrl,
      auth_signature_url: authSigUrl,
    });

    return NextResponse.json({ success: true, license: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}
