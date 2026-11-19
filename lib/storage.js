import fs from 'fs/promises';
import path from 'path';

// NEXT_PUBLIC_STORAGE=blob  -> ใช้ Vercel Blob (private) เหมาะกับ Vercel
// ไม่ตั้งค่า               -> เก็บในโฟลเดอร์ storage/ ของเครื่อง (ใช้ตอนพัฒนา)
export const USE_BLOB = process.env.NEXT_PUBLIC_STORAGE === 'blob';
export const ROOT = path.join(process.cwd(), 'storage');

const RE = /^\/api\/files\/(models|previews)\/([a-f0-9-]{36}\.(?:rbxm|png|jpg|webp))$/;
export const parseStoredUrl = (url) => {
  const m = RE.exec(url || '');
  return m ? { kind: m[1], name: m[2] } : null;
};
export const filePath = (kind, name) => path.join(ROOT, kind, name);
const blobPath = (kind, name) => `${kind}/${name}`;

export async function saveStored(kind, name, buf) {
  await fs.mkdir(path.join(ROOT, kind), { recursive: true });
  await fs.writeFile(filePath(kind, name), buf);
}

// คืน Buffer หรือ null ถ้าไม่พบ
export async function readStored(kind, name) {
  if (USE_BLOB) {
    const { get } = await import('@vercel/blob');
    const r = await get(blobPath(kind, name), { access: 'private' });
    if (!r || r.statusCode !== 200) return null;
    return Buffer.from(await new Response(r.stream).arrayBuffer());
  }
  try { return await fs.readFile(filePath(kind, name)); } catch { return null; }
}

// คืน body สำหรับส่งให้ Response (สตรีมเมื่อใช้ Blob) หรือ null
export async function streamStored(kind, name) {
  if (USE_BLOB) {
    const { get } = await import('@vercel/blob');
    const r = await get(blobPath(kind, name), { access: 'private' });
    if (!r || r.statusCode !== 200) return null;
    return r.stream;
  }
  return readStored(kind, name);
}

// ลบแบบ best-effort ถ้าลบไม่สำเร็จจะเหลือไฟล์ค้าง (ลบเองได้ที่แดชบอร์ด Blob)
export async function removeStored(url) {
  const p = parseStoredUrl(url);
  if (!p) return;
  if (USE_BLOB) {
    try {
      const { del } = await import('@vercel/blob');
      await del(blobPath(p.kind, p.name));
    } catch (e) { console.error('blob delete failed:', e?.message); }
    return;
  }
  await fs.unlink(filePath(p.kind, p.name)).catch(() => {});
}
