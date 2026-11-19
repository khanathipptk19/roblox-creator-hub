import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { USE_BLOB, parseStoredUrl, readStored } from '@/lib/storage';
import { scanBuffer } from '@/lib/rbxmScan';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { url } = await req.json().catch(() => ({}));

  let buf = null;
  const p = parseStoredUrl(url);
  if (p && p.kind === 'models') buf = await readStored('models', p.name);
  else if (!USE_BLOB && /^\/models\/[\w.\-]+\.rbxm$/.test(url || '')) {
    buf = await fs.readFile(path.join(process.cwd(), 'public', url)).catch(() => null);
  } else {
    return NextResponse.json({ error: 'สแกนได้เฉพาะไฟล์ .rbxm ที่อัปโหลดไว้ในระบบ' }, { status: 400 });
  }
  if (!buf) return NextResponse.json({ error: 'ไม่พบไฟล์ อาจถูกลบไปแล้ว' }, { status: 404 });

  try { return NextResponse.json({ scan: scanBuffer(buf) }); }
  catch (e) { console.error('SCAN ERROR', e); return NextResponse.json({ error: 'สแกนไม่สำเร็จ' }, { status: 500 }); }
}
