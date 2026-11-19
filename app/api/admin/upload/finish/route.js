import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { readStored, removeStored } from '@/lib/storage';
import { imageExt, isRbxm } from '@/lib/fileCheck';
import { scanBuffer } from '@/lib/rbxmScan';

export const runtime = 'nodejs';
export const maxDuration = 60;

// เบราว์เซอร์อัปโหลดไป Blob แล้ว ตรงนี้ดึงไฟล์มาตรวจเนื้อหาจริง ถ้าไม่ผ่านจะลบทิ้ง
export async function POST(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { pathname, original } = await req.json().catch(() => ({}));
  const m = /^(models|previews)\/([a-f0-9-]{36}\.(rbxm|png|jpg|webp))$/.exec(pathname || '');
  if (!m) return NextResponse.json({ error: 'คำขอไม่ถูกต้อง' }, { status: 400 });
  const [, folder, name, ext] = m;
  const url = `/api/files/${folder}/${name}`;

  const buf = await readStored(folder, name);
  if (!buf) return NextResponse.json({ error: 'ไม่พบไฟล์ที่อัปโหลด' }, { status: 404 });

  const ok = folder === 'models' ? ext === 'rbxm' && isRbxm(buf, original) : imageExt(buf) === ext;
  if (!ok) {
    await removeStored(url);
    return NextResponse.json({ error: folder === 'models' ? 'ต้องเป็นไฟล์ .rbxm ที่ถูกต้อง' : 'รองรับเฉพาะรูป PNG, JPG, WEBP' }, { status: 400 });
  }

  let scan = null;
  if (folder === 'models') { try { scan = scanBuffer(buf); } catch (e) { console.error('SCAN ERROR', e); } }
  return NextResponse.json({ ok: true, url, size: buf.length, original: String(original || '').slice(0, 120), scan });
}
