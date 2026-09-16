import { NextRequest, NextResponse } from 'next/server';
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

    const id = body.id || `lic_${crypto.randomBytes(8).toString('hex')}`;

    const result = await client.query(`
      INSERT INTO licenses (
        id, license_number, template, name, relation, dob, blood_group, organ_donor,
        issue_date, validity_nt, validity_tr, first_issue_date, status,
        address, address_1, address_2,
        perm_address_1, perm_address_2, perm_address_3,
        pres_address_1, pres_address_2, pres_address_3,
        auth_office, auth_title, emergency_contact, allowed_vehicles,
        photo_url, qr_data, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,
        $9,$10,$11,$12,$13,
        $14,$15,$16,
        $17,$18,$19,
        $20,$21,$22,
        $23,$24,$25,$26,
        $27,$28,NOW()
      )
      ON CONFLICT (license_number) DO UPDATE SET
        template = EXCLUDED.template,
        name = EXCLUDED.name,
        relation = EXCLUDED.relation,
        dob = EXCLUDED.dob,
        blood_group = EXCLUDED.blood_group,
        organ_donor = EXCLUDED.organ_donor,
        issue_date = EXCLUDED.issue_date,
        validity_nt = EXCLUDED.validity_nt,
        validity_tr = EXCLUDED.validity_tr,
        first_issue_date = EXCLUDED.first_issue_date,
        status = EXCLUDED.status,
        address = EXCLUDED.address,
        address_1 = EXCLUDED.address_1,
        address_2 = EXCLUDED.address_2,
        perm_address_1 = EXCLUDED.perm_address_1,
        perm_address_2 = EXCLUDED.perm_address_2,
        perm_address_3 = EXCLUDED.perm_address_3,
        pres_address_1 = EXCLUDED.pres_address_1,
        pres_address_2 = EXCLUDED.pres_address_2,
        pres_address_3 = EXCLUDED.pres_address_3,
        auth_office = EXCLUDED.auth_office,
        auth_title = EXCLUDED.auth_title,
        emergency_contact = EXCLUDED.emergency_contact,
        allowed_vehicles = EXCLUDED.allowed_vehicles,
        photo_url = COALESCE(EXCLUDED.photo_url, licenses.photo_url),
        qr_data = EXCLUDED.qr_data,
        updated_at = NOW()
      RETURNING *
    `, [
      id, licenseNumber, body.template || '1',
      body.name || '', body.relation || '', body.dob || '',
      body.blood_group || '', body.organ_donor || 'N',
      body.issue_date || '', body.validity_nt || '', body.validity_tr || '',
      body.first_issue_date || '', body.status || 'VALID',
      body.address || '', body.address_1 || '', body.address_2 || '',
      body.perm_address_1 || '', body.perm_address_2 || '', body.perm_address_3 || '',
      body.pres_address_1 || '', body.pres_address_2 || '', body.pres_address_3 || '',
      body.auth_office || '', body.auth_title || '', body.emergency_contact || '',
      body.allowed_vehicles || 'MCWG, LMV',
      photoUrl, body.qr_data || null,
    ]);

    return NextResponse.json({ success: true, license: result.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}
