import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import { requireAdmin } from '@/lib/auth';
import { ROOT } from '@/lib/storage';
import { scanBuffer } from '@/lib/rbxmScan';
import path from 'path';

export const runtime = 'nodejs';
const LIMITS = { model: 25 * 1024 * 1024, preview: 3 * 1024 * 1024 };

function imageExt(b) {
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return null;
}

export async function POST(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let form;
  try { form = await req.formData(); } catch { return NextResponse.json({ error: 'อ่านไฟล์ไม่ได้' }, { status: 400 }); }
  const file = form.get('file');
  const kind = form.get('kind');
  if (!file || typeof file.arrayBuffer !== 'function' || !['model', 'preview'].includes(kind)) {
    return NextResponse.json({ error: 'คำขอไม่ถูกต้อง' }, { status: 400 });
  }
  if (file.size === 0) return NextResponse.json({ error: 'ไฟล์ว่างเปล่า' }, { status: 400 });
  if (file.size > LIMITS[kind]) return NextResponse.json({ error: `ไฟล์ใหญ่เกิน ${LIMITS[kind] / 1024 / 1024} MB` }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  let ext;
  if (kind === 'model') {
    // .rbxm แบบไบนารีขึ้นต้นด้วย "<roblox!" ส่วนแบบ XML ขึ้นต้นด้วย "<roblox"
    const bin = buf.subarray(0, 8).toString('latin1') === '<roblox!';
    const xml = buf.subarray(0, 64).toString('utf8').trimStart().startsWith('<roblox');
    if (!/\.rbxm$/i.test(String(file.name)) || (!bin && !xml)) {
      return NextResponse.json({ error: 'ต้องเป็นไฟล์ .rbxm ที่ถูกต้อง' }, { status: 400 });
    }
    ext = 'rbxm';
  } else {
    ext = imageExt(buf);
    if (!ext) return NextResponse.json({ error: 'รองรับเฉพาะรูป PNG, JPG, WEBP' }, { status: 400 });
  }

  // ตั้งชื่อไฟล์เองด้วย UUID ไม่ใช้ชื่อจากผู้ใช้ กัน path traversal
  const folder = kind === 'model' ? 'models' : 'previews';
  const name = `${crypto.randomUUID()}.${ext}`;
  await fs.mkdir(path.join(ROOT, folder), { recursive: true });
  await fs.writeFile(path.join(ROOT, folder, name), buf);
  let scan = null;
  if (kind === 'model') {
    try { scan = scanBuffer(buf); } catch (e) { console.error('SCAN ERROR', e); }
  }
  return NextResponse.json({ ok: true, url: `/api/files/${folder}/${name}`, size: buf.length, original: String(file.name).slice(0, 120), scan });
}
