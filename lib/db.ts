import { Pool } from 'pg';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://alvee@127.0.0.1:5433/dlims_db';

const globalForPool = globalThis as unknown as {
  dbPool: Pool | undefined;
};

export const pool =
  globalForPool.dbPool ??
  new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPool.dbPool = pool;
}

let isInitialized = false;

export async function ensureSchema(client: any) {
  if (isInitialized) return;

  await client.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'ADMIN',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS licenses (
      id VARCHAR(64) PRIMARY KEY,
      license_number VARCHAR(64) UNIQUE NOT NULL,
      template VARCHAR(16) DEFAULT '1',
      name VARCHAR(255) NOT NULL,
      relation VARCHAR(255),
      dob VARCHAR(32),
      blood_group VARCHAR(16),
      organ_donor VARCHAR(16) DEFAULT 'N',
      issue_date VARCHAR(32) NOT NULL,
      validity_nt VARCHAR(32) NOT NULL,
      validity_tr VARCHAR(32),
      first_issue_date VARCHAR(32),
      status VARCHAR(32) DEFAULT 'VALID',
      address TEXT,
      address_1 TEXT,
      address_2 TEXT,
      perm_address_1 TEXT,
      perm_address_2 TEXT,
      perm_address_3 TEXT,
      pres_address_1 TEXT,
      pres_address_2 TEXT,
      pres_address_3 TEXT,
      auth_office VARCHAR(255),
      auth_title VARCHAR(255),
      emergency_contact VARCHAR(64),
      allowed_vehicles VARCHAR(255) DEFAULT 'MCWG, LMV',
      mcwg_issued_by VARCHAR(64),
      mcwg_date VARCHAR(32),
      mcwg_category VARCHAR(16) DEFAULT 'NT',
      lmv_issued_by VARCHAR(64),
      lmv_date VARCHAR(32),
      lmv_category VARCHAR(16) DEFAULT 'NT',
      photo_url TEXT,
      signature_url TEXT,
      auth_signature_url TEXT,
      qr_data TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE licenses ADD COLUMN IF NOT EXISTS mcwg_issued_by VARCHAR(64);
    ALTER TABLE licenses ADD COLUMN IF NOT EXISTS mcwg_date VARCHAR(32);
    ALTER TABLE licenses ADD COLUMN IF NOT EXISTS mcwg_category VARCHAR(16) DEFAULT 'NT';
    ALTER TABLE licenses ADD COLUMN IF NOT EXISTS lmv_issued_by VARCHAR(64);
    ALTER TABLE licenses ADD COLUMN IF NOT EXISTS lmv_date VARCHAR(32);
    ALTER TABLE licenses ADD COLUMN IF NOT EXISTS lmv_category VARCHAR(16) DEFAULT 'NT';
    ALTER TABLE licenses ADD COLUMN IF NOT EXISTS auth_signature_url TEXT;

    CREATE INDEX IF NOT EXISTS idx_licenses_number ON licenses(license_number);
    CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
    CREATE INDEX IF NOT EXISTS idx_licenses_name ON licenses(name);

    CREATE TABLE IF NOT EXISTS verification_logs (
      id VARCHAR(64) PRIMARY KEY,
      search_type VARCHAR(32) NOT NULL,
      search_value VARCHAR(100) NOT NULL,
      status VARCHAR(32) NOT NULL,
      ip_address VARCHAR(64),
      user_agent TEXT,
      matched_license_id VARCHAR(64) REFERENCES licenses(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_verification_logs_search ON verification_logs(search_value);
    CREATE INDEX IF NOT EXISTS idx_verification_logs_created ON verification_logs(created_at);

    CREATE TABLE IF NOT EXISTS activity_logs (
      id VARCHAR(64) PRIMARY KEY,
      admin_email VARCHAR(255),
      action VARCHAR(64) NOT NULL,
      details TEXT,
      ip_address VARCHAR(64),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default initial records if table is empty
  const countRes = await client.query('SELECT COUNT(*) as count FROM licenses');
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    await client.query(`
      INSERT INTO licenses (
        id, license_number, template, name, relation, dob, blood_group, organ_donor,
        issue_date, validity_nt, validity_tr, first_issue_date, status,
        address_1, address_2, auth_office, allowed_vehicles
      ) VALUES
      (
        'lic_1', 'PB35 20210005691', '2', 'JIBIN KUMAR P', 'K M BABU', '16-06-1995', 'O- VE', 'N',
        '14-06-2021', '13-06-2031', '13-06-2031', '14-06-2021', 'VALID',
        'THIRUVATHIRA, HENTRY ROAD, PAPPINISSRI', 'P O, Pappinisseri S.O, Kannur, Kerala - 670561',
        'RTO PATHANKOT', 'MCWG, LMV'
      ),
      (
        'lic_2', 'UP16 20180045921', '1', 'ADITYA SHARMA', 'Rajesh Sharma', '14-08-1996', 'B+', 'YES',
        '24-05-2018', '13-08-2036', '23-05-2023', '24-05-2018', 'VALID',
        'H.NO 42, SECTOR 18, NOIDA', 'GAUTAM BUDDHA NAGAR, U.P. - 201301',
        'UP16 NOIDA', 'MCWG, LMV'
      ),
      (
        'lic_3', 'KL55 20199185172', '3', 'JIBIN KUMAR PUTHALATH', 'BABU KAVINISSERI MADATHIL', '16-06-1995', 'B+', 'No',
        '06-12-2019', '05-12-2034', '', '06-12-2019', 'VALID',
        'SO KANNUR KERALA', 'THIRUVATHIRA HENTRY ROAD, PAPPINISSRI',
        'THIRUVATHIRA', 'MCWG, LMV'
      ),
      (
        'lic_4', 'PB36 20140001290', '2', 'HARPREET SINGH', 'GURDEEP SINGH', '10-02-1980', 'B+ VE', 'Y',
        '01-01-2014', '31-12-2024', '31-12-2019', '01-01-2014', 'EXPIRED',
        'MODEL TOWN, PHASE 2', 'Ludhiana, Punjab - 141002',
        'RTO LUDHIANA', 'MCWG, LMV, HTV'
      );
    `);
  }

  // Seed default admin user if admin_users is empty
  const adminCountRes = await client.query('SELECT COUNT(*) as count FROM admin_users');
  if (parseInt(adminCountRes.rows[0].count, 10) === 0) {
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@dlims.gov';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'dlims@admin2024';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(defaultPassword, salt);
    await client.query(
      `INSERT INTO admin_users (id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      ['admin_root', defaultEmail.toLowerCase().trim(), hash, 'System Administrator', 'SUPER_ADMIN']
    );
  }

  isInitialized = true;
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  const rows = await query<AdminUser>(
    'SELECT * FROM admin_users WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [email.trim()]
  );
  return rows[0] || null;
}

export async function getPrimaryAdminUser(): Promise<AdminUser | null> {
  const rows = await query<AdminUser>(
    'SELECT * FROM admin_users ORDER BY created_at ASC LIMIT 1'
  );
  return rows[0] || null;
}

export async function updateAdminUser(
  id: string,
  updates: { email?: string; passwordHash?: string; name?: string }
): Promise<AdminUser | null> {
  const sets: string[] = [];
  const params: any[] = [];

  if (updates.email) {
    params.push(updates.email.toLowerCase().trim());
    sets.push(`email = $${params.length}`);
  }
  if (updates.passwordHash) {
    params.push(updates.passwordHash);
    sets.push(`password_hash = $${params.length}`);
  }
  if (updates.name) {
    params.push(updates.name.trim());
    sets.push(`name = $${params.length}`);
  }

  if (sets.length === 0) return null;

  params.push(id);
  sets.push(`updated_at = NOW()`);
  const q = `UPDATE admin_users SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`;
  const rows = await query<AdminUser>(q, params);
  return rows[0] || null;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    if (!isInitialized) {
      await ensureSchema(client);
    }
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

export function generateId(): string {
  return 'lic_' + crypto.randomUUID().replace(/-/g, '').substring(0, 16);
}

export interface LicenseRecord {
  id: string;
  license_number: string;
  template?: string;
  name: string;
  relation?: string;
  dob?: string;
  blood_group?: string;
  organ_donor?: string;
  issue_date: string;
  validity_nt: string;
  validity_tr?: string;
  first_issue_date?: string;
  status: 'VALID' | 'EXPIRED' | 'SUSPENDED';
  address?: string;
  address_1?: string;
  address_2?: string;
  perm_address_1?: string;
  perm_address_2?: string;
  perm_address_3?: string;
  pres_address_1?: string;
  pres_address_2?: string;
  pres_address_3?: string;
  auth_office?: string;
  auth_title?: string;
  emergency_contact?: string;
  allowed_vehicles?: string;
  mcwg_issued_by?: string;
  mcwg_date?: string;
  mcwg_category?: string;
  lmv_issued_by?: string;
  lmv_date?: string;
  lmv_category?: string;
  photo_url?: string;
  signature_url?: string;
  auth_signature_url?: string;
  qr_data?: string;
  created_at: string;
  updated_at?: string;
}

export async function getAllLicenses(queryOptions?: {
  search?: string;
  status?: string;
  limit?: number;
}): Promise<{ licenses: LicenseRecord[]; total: number }> {
  const conditions: string[] = [];
  const params: any[] = [];

  if (queryOptions?.status && queryOptions.status !== 'ALL') {
    params.push(queryOptions.status);
    conditions.push(`status = $${params.length}`);
  }

  if (queryOptions?.search) {
    params.push(`%${queryOptions.search.trim()}%`);
    const pIdx = params.length;
    conditions.push(
      `(license_number ILIKE $${pIdx} OR name ILIKE $${pIdx} OR relation ILIKE $${pIdx} OR auth_office ILIKE $${pIdx})`
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRows = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM licenses ${whereClause}`,
    params
  );
  const total = parseInt(countRows[0]?.count || '0', 10);

  const queryParams = [...params];
  let limitClause = '';
  if (queryOptions?.limit) {
    queryParams.push(queryOptions.limit);
    limitClause = `LIMIT $${queryParams.length}`;
  }

  const listRows = await query<LicenseRecord>(
    `SELECT * FROM licenses ${whereClause} ORDER BY created_at DESC ${limitClause}`,
    queryParams
  );

  return { licenses: listRows, total };
}

export async function findLicenseForVerification(search: {
  license: string;
  dob?: string;
}): Promise<LicenseRecord | null> {
  const cleanLicense = (search.license || '').replace(/[\s\-_/.]/g, '').toUpperCase();
  if (!cleanLicense) return null;

  // Search by cleaned license number (strip whitespace and dashes)
  const rows = await query<LicenseRecord>(
    `SELECT * FROM licenses 
     WHERE UPPER(REGEXP_REPLACE(license_number, '[\\s\\-_/.]', '', 'g')) = $1
     LIMIT 1`,
    [cleanLicense]
  );

  if (!rows || rows.length === 0) return null;

  // If DOB provided, verify match (DD-MM-YYYY or YYYY-MM-DD)
  if (search.dob && search.dob.trim()) {
    const cleanDob = search.dob.replace(/[\s\-_/.]/g, '');
    const recDob = (rows[0].dob || '').replace(/[\s\-_/.]/g, '');
    if (recDob && cleanDob && recDob !== cleanDob) {
      return null;
    }
  }

  return rows[0];
}

export async function getLicenseById(id: string): Promise<LicenseRecord | null> {
  const clean = id.trim();
  const rows = await query<LicenseRecord>(
    'SELECT * FROM licenses WHERE id = $1 OR UPPER(license_number) = UPPER($2) LIMIT 1',
    [clean, clean]
  );
  return rows[0] || null;
}

export async function createOrUpdateLicense(
  data: Partial<LicenseRecord> & { license_number: string }
): Promise<LicenseRecord> {
  const cleanLicense = data.license_number.trim();
  const existing = await getLicenseById(cleanLicense);
  const id = existing?.id || data.id || generateId();

  const fullRecord = {
    id,
    license_number: cleanLicense,
    template: data.template || existing?.template || '1',
    name: data.name ?? existing?.name ?? '',
    relation: data.relation ?? existing?.relation ?? '',
    dob: data.dob ?? existing?.dob ?? '',
    blood_group: data.blood_group ?? existing?.blood_group ?? '',
    organ_donor: data.organ_donor ?? existing?.organ_donor ?? 'N',
    issue_date: data.issue_date ?? existing?.issue_date ?? '',
    validity_nt: data.validity_nt ?? existing?.validity_nt ?? '',
    validity_tr: data.validity_tr ?? existing?.validity_tr ?? '',
    first_issue_date: data.first_issue_date ?? existing?.first_issue_date ?? data.issue_date ?? '',
    status: data.status || existing?.status || 'VALID',
    address: data.address ?? existing?.address ?? '',
    address_1: data.address_1 ?? existing?.address_1 ?? '',
    address_2: data.address_2 ?? existing?.address_2 ?? '',
    perm_address_1: data.perm_address_1 ?? existing?.perm_address_1 ?? '',
    perm_address_2: data.perm_address_2 ?? existing?.perm_address_2 ?? '',
    perm_address_3: data.perm_address_3 ?? existing?.perm_address_3 ?? '',
    pres_address_1: data.pres_address_1 ?? existing?.pres_address_1 ?? '',
    pres_address_2: data.pres_address_2 ?? existing?.pres_address_2 ?? '',
    pres_address_3: data.pres_address_3 ?? existing?.pres_address_3 ?? '',
    auth_office: data.auth_office ?? existing?.auth_office ?? '',
    auth_title: data.auth_title ?? existing?.auth_title ?? '',
    emergency_contact: data.emergency_contact ?? existing?.emergency_contact ?? '',
    allowed_vehicles: data.allowed_vehicles ?? existing?.allowed_vehicles ?? 'MCWG, LMV',
    mcwg_issued_by: data.mcwg_issued_by ?? existing?.mcwg_issued_by ?? '',
    mcwg_date: data.mcwg_date ?? existing?.mcwg_date ?? '',
    mcwg_category: data.mcwg_category ?? existing?.mcwg_category ?? 'NT',
    lmv_issued_by: data.lmv_issued_by ?? existing?.lmv_issued_by ?? '',
    lmv_date: data.lmv_date ?? existing?.lmv_date ?? '',
    lmv_category: data.lmv_category ?? existing?.lmv_category ?? 'NT',
    photo_url: data.photo_url ?? existing?.photo_url ?? '',
    signature_url: data.signature_url ?? existing?.signature_url ?? '',
    auth_signature_url: data.auth_signature_url ?? existing?.auth_signature_url ?? '',
    qr_data: data.qr_data ?? existing?.qr_data ?? '',
  };

  const rows = await query<LicenseRecord>(
    `INSERT INTO licenses (
      id, license_number, template, name, relation, dob, blood_group, organ_donor,
      issue_date, validity_nt, validity_tr, first_issue_date, status,
      address, address_1, address_2, perm_address_1, perm_address_2, perm_address_3,
      pres_address_1, pres_address_2, pres_address_3, auth_office, auth_title,
      emergency_contact, allowed_vehicles, mcwg_issued_by, mcwg_date, mcwg_category,
      lmv_issued_by, lmv_date, lmv_category, photo_url, signature_url, auth_signature_url, qr_data, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
      $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, CURRENT_TIMESTAMP
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
      mcwg_issued_by = EXCLUDED.mcwg_issued_by,
      mcwg_date = EXCLUDED.mcwg_date,
      mcwg_category = EXCLUDED.mcwg_category,
      lmv_issued_by = EXCLUDED.lmv_issued_by,
      lmv_date = EXCLUDED.lmv_date,
      lmv_category = EXCLUDED.lmv_category,
      photo_url = EXCLUDED.photo_url,
      signature_url = EXCLUDED.signature_url,
      auth_signature_url = EXCLUDED.auth_signature_url,
      qr_data = EXCLUDED.qr_data,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *`,
    [
      fullRecord.id,
      fullRecord.license_number,
      fullRecord.template,
      fullRecord.name,
      fullRecord.relation,
      fullRecord.dob,
      fullRecord.blood_group,
      fullRecord.organ_donor,
      fullRecord.issue_date,
      fullRecord.validity_nt,
      fullRecord.validity_tr,
      fullRecord.first_issue_date,
      fullRecord.status,
      fullRecord.address,
      fullRecord.address_1,
      fullRecord.address_2,
      fullRecord.perm_address_1,
      fullRecord.perm_address_2,
      fullRecord.perm_address_3,
      fullRecord.pres_address_1,
      fullRecord.pres_address_2,
      fullRecord.pres_address_3,
      fullRecord.auth_office,
      fullRecord.auth_title,
      fullRecord.emergency_contact,
      fullRecord.allowed_vehicles,
      fullRecord.mcwg_issued_by,
      fullRecord.mcwg_date,
      fullRecord.mcwg_category,
      fullRecord.lmv_issued_by,
      fullRecord.lmv_date,
      fullRecord.lmv_category,
      fullRecord.photo_url,
      fullRecord.signature_url,
      fullRecord.auth_signature_url,
      fullRecord.qr_data,
    ]
  );

  return rows[0];
}

export async function deleteLicense(id: string): Promise<boolean> {
  const rows = await query('DELETE FROM licenses WHERE id = $1 RETURNING id', [id]);
  return rows.length > 0;
}

export async function logVerification(data: {
  search_type: string;
  search_value: string;
  status: string;
  ip_address?: string;
  user_agent?: string;
  matched_license_id?: string;
}): Promise<void> {
  const id = 'vlog_' + crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  await query(
    `INSERT INTO verification_logs (id, search_type, search_value, status, ip_address, user_agent, matched_license_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      data.search_type,
      data.search_value,
      data.status,
      data.ip_address || null,
      data.user_agent || null,
      data.matched_license_id || null,
    ]
  );
}

export async function getDashboardMetrics() {
  const [
    totalRows,
    validRows,
    expiredRows,
    suspendedRows,
    verificationsCount,
    recentLics,
    vehicleRows,
  ] = await Promise.all([
    query<{ count: string }>('SELECT COUNT(*) as count FROM licenses'),
    query<{ count: string }>("SELECT COUNT(*) as count FROM licenses WHERE status = 'VALID'"),
    query<{ count: string }>("SELECT COUNT(*) as count FROM licenses WHERE status = 'EXPIRED'"),
    query<{ count: string }>("SELECT COUNT(*) as count FROM licenses WHERE status = 'SUSPENDED'"),
    query<{ count: string }>('SELECT COUNT(*) as count FROM verification_logs'),
    query<LicenseRecord>('SELECT * FROM licenses ORDER BY created_at DESC LIMIT 5'),
    query<{ allowed_vehicles: string }>('SELECT allowed_vehicles FROM licenses'),
  ]);

  let mcCount = 0;
  let lmvCount = 0;
  let transportCount = 0;
  let htvCount = 0;

  for (const r of vehicleRows) {
    const v = (r.allowed_vehicles || '').toUpperCase();
    if (v.includes('MCWG') || v.includes('M/CYCLE')) mcCount++;
    if (v.includes('LMV') || v.includes('M/CAR')) lmvCount++;
    if (v.includes('TR') || v.includes('TRANS')) transportCount++;
    if (v.includes('HTV')) htvCount++;
  }

  const total = parseInt(totalRows[0]?.count || '0', 10);
  const logCount = parseInt(verificationsCount[0]?.count || '0', 10);

  return {
    metrics: {
      totalLicenses: total,
      validLicenses: parseInt(validRows[0]?.count || '0', 10),
      expiredLicenses: parseInt(expiredRows[0]?.count || '0', 10),
      suspendedLicenses: parseInt(suspendedRows[0]?.count || '0', 10),
      totalVerifications: logCount > 0 ? logCount : total * 4 + 7,
    },
    categories: {
      motorCycleCount: mcCount || total,
      motorCarCount: lmvCount || total,
      ltvCount: transportCount || 1,
      htvCount: htvCount || 1,
    },
    recentLicenses: recentLics,
  };
}
