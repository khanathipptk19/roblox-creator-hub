import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { parseStoredUrl, filePath } from '@/lib/storage';
import { scanBuffer } from '@/lib/rbxmScan';

export const runtime = 'nodejs';

export async function POST(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { url } = await req.json().catch(() => ({}));

  let file = null;
  const p = parseStoredUrl(url);
  if (p && p.kind === 'models') file = filePath('models', p.name);
  else if (/^\/models\/[\w.\-]+\.rbxm$/.test(url || '')) file = path.join(process.cwd(), 'public', url);
  if (!file) return NextResponse.json({ error: 'สแกนได้เฉพาะไฟล์ .rbxm ที่อัปโหลดไว้ในระบบ' }, { status: 400 });

  let buf;
  try { buf = await fs.readFile(file); } catch { return NextResponse.json({ error: 'ไม่พบไฟล์ อาจถูกลบไปแล้ว' }, { status: 404 }); }
  try { return NextResponse.json({ scan: scanBuffer(buf) }); }
  catch (e) { console.error('SCAN ERROR', e); return NextResponse.json({ error: 'สแกนไม่สำเร็จ' }, { status: 500 }); }
}
