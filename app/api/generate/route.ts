import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const BASE_DIR = process.env.BASE_DIR || process.cwd();

function saveB64Temp(b64: string | null | undefined, filename: string): string | null {
  if (!b64 || typeof b64 !== 'string') return null;
  try {
    let clean = b64.trim();
    if (clean.startsWith('blob:')) return null;
    if (clean.includes(',')) {
      clean = clean.split(',')[1];
    }
    const buf = Buffer.from(clean, 'base64');
    if (buf.length === 0) return null;
    const p = path.join(os.tmpdir(), filename);
    writeFileSync(p, buf);
    return p;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let tmpJson = '';
  let tmpOut = '';
  const tmpFiles: string[] = [];

  try {
    const body = await req.json();
    const { template = '1', data = {}, photo_base64, holder_sig_base64, auth_sig_base64, preview = true, download = false, format = 'png' } = body;

    // Normalize template: handle "1", "2", "3", "templet 1", "template 2", etc.
    let tStr = String(template || '1').trim().toLowerCase();
    tStr = tStr.replace(/^templet\s*/i, '').replace(/^template\s*/i, '').trim();
    if (!['1', '2', '3'].includes(tStr)) {
      tStr = '1';
    }
    const templateDir = path.join(BASE_DIR, `templet ${tStr}`);

    if (!existsSync(templateDir)) {
      return NextResponse.json({ error: `Template directory not found: templet ${tStr}` }, { status: 400 });
    }

    const ts = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    tmpJson = path.join(os.tmpdir(), `dl_data_${ts}.json`);
    tmpOut  = path.join(os.tmpdir(), `dl_out_${ts}.png`);
    tmpFiles.push(tmpJson, tmpOut);

    // Sanitize data values so none are null/undefined
    const cleanData: Record<string, any> = {};
    for (const [k, v] of Object.entries(data || {})) {
      cleanData[k] = v === null || v === undefined ? '' : v;
    }

    // Determine current host/origin so QR points to localhost or live domain dynamically
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const proto = req.headers.get('x-forwarded-proto') || (isLocal ? 'http' : 'https');
    const origin = `${proto}://${host}`;
    if (!cleanData.base_url) {
      cleanData.base_url = origin;
    }

    writeFileSync(tmpJson, JSON.stringify(cleanData, null, 2));

    // Optional user-uploaded images
    const photoTmp  = saveB64Temp(photo_base64,       `dl_photo_${ts}.png`);
    const holderTmp = saveB64Temp(holder_sig_base64,  `dl_hsig_${ts}.png`);
    const authTmp   = saveB64Temp(auth_sig_base64,    `dl_asig_${ts}.png`);
    if (photoTmp)  tmpFiles.push(photoTmp);
    if (holderTmp) tmpFiles.push(holderTmp);
    if (authTmp)   tmpFiles.push(authTmp);

    // Build python command arguments
    const args = ['generate_card.py', '--json', tmpJson, '--output', tmpOut];

    // Pass fast web-optimized preview flag if not downloading
    const isFastPreview = !download && Boolean(preview);
    if (isFastPreview) {
      args.push('--preview');
    }

    // Only apply photo if user provided one, else 'none'
    args.push('--photo', photoTmp || 'none');

    // Only apply holder signature if user provided one, else 'none'
    args.push('--signature', holderTmp || 'none');

    // Authority signature: only use if explicitly uploaded, NO demo signature
    const finalAuth = authTmp || 'none';
    if (tStr === '1') {
      args.push('--auth-signature', finalAuth);
    } else if (tStr === '2') {
      args.push('--auth_signature', finalAuth);
    }

    await execFileAsync('python3', args, { cwd: templateDir, timeout: 15000 });

    if (!existsSync(tmpOut)) {
      return NextResponse.json({ error: 'Card generator finished but output image was not created' }, { status: 500 });
    }

    const imgBuf = readFileSync(tmpOut);

    if (download) {
      if (format === 'pdf') {
        const tmpPdf = path.join(os.tmpdir(), `dl_pdf_${ts}.pdf`);
        tmpFiles.push(tmpPdf);
        await execFileAsync('python3', [
          '-c',
          `from PIL import Image\nimg = Image.open('${tmpOut}').convert('RGB')\nimg.save('${tmpPdf}', 'PDF', resolution=300.0)`
        ]);
        const pdfBuf = readFileSync(tmpPdf);
        const filename = `DL_${cleanData.dl_no?.replace(/\s+/g, '_') || `template_${tStr}`}.pdf`;
        return new NextResponse(new Uint8Array(pdfBuf), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      const filename = `DL_${cleanData.dl_no?.replace(/\s+/g, '_') || `template_${tStr}`}.png`;
      return new NextResponse(new Uint8Array(imgBuf), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Default preview response
    const mimeType = isFastPreview ? 'image/jpeg' : 'image/png';
    const base64 = imgBuf.toString('base64');
    return NextResponse.json({
      success: true,
      imageBase64: `data:${mimeType};base64,${base64}`,
      licenseNumber: cleanData.dl_no || '',
    });

  } catch (err: any) {
    console.error('API /api/generate error:', err);
    return NextResponse.json({ error: err.message || 'Internal error generating DL card' }, { status: 500 });
  } finally {
    for (const f of tmpFiles) {
      try { if (existsSync(f)) unlinkSync(f); } catch {}
    }
  }
}
