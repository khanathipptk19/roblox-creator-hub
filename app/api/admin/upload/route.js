import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAdmin } from '@/lib/auth';
import { USE_BLOB, saveStored } from '@/lib/storage';
import { scanBuffer } from '@/lib/rbxmScan';
import { MODEL_MAX, PREVIEW_MAX, imageExt, isRbxm } from '@/lib/fileCheck';

export const runtime = 'nodejs';

// ใช้เฉพาะตอนพัฒนาในเครื่อง (เก็บลงดิสก์) บน Vercel ใช้การอัปโหลดตรงไป Blob แทน
export async function POST(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (USE_BLOB) return NextResponse.json({ error: 'โหมด Blob ใช้การอัปโหลดตรงจากเบราว์เซอร์' }, { status: 400 });

  let form;
  try { form = await req.formData(); } catch { return NextResponse.json({ error: 'อ่านไฟล์ไม่ได้' }, { status: 400 }); }
  const file = form.get('file');
  const kind = form.get('kind');
  if (!file || typeof file.arrayBuffer !== 'function' || !['model', 'preview'].includes(kind)) {
    return NextResponse.json({ error: 'คำขอไม่ถูกต้อง' }, { status: 400 });
  }
  const limit = kind === 'model' ? MODEL_MAX : PREVIEW_MAX;
  if (file.size === 0) return NextResponse.json({ error: 'ไฟล์ว่างเปล่า' }, { status: 400 });
  if (file.size > limit) return NextResponse.json({ error: `ไฟล์ใหญ่เกิน ${limit / 1024 / 1024} MB` }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  let ext;
  if (kind === 'model') {
    if (!isRbxm(buf, file.name)) return NextResponse.json({ error: 'ต้องเป็นไฟล์ .rbxm ที่ถูกต้อง' }, { status: 400 });
    ext = 'rbxm';
  } else {
    ext = imageExt(buf);
    if (!ext) return NextResponse.json({ error: 'รองรับเฉพาะรูป PNG, JPG, WEBP' }, { status: 400 });
  }

  const folder = kind === 'model' ? 'models' : 'previews';
  const name = `${crypto.randomUUID()}.${ext}`;
  await saveStored(folder, name, buf);

  let scan = null;
  if (kind === 'model') { try { scan = scanBuffer(buf); } catch (e) { console.error('SCAN ERROR', e); } }
  return NextResponse.json({ ok: true, url: `/api/files/${folder}/${name}`, size: buf.length, original: String(file.name).slice(0, 120), scan });
}
