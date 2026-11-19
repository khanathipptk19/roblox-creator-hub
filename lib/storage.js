import fs from 'fs/promises';
import path from 'path';

// ไฟล์อัปโหลดเก็บนอกโฟลเดอร์ public เพื่อบังคับล็อกอินและตรวจสถานะก่อนดาวน์โหลด
export const ROOT = path.join(process.cwd(), 'storage');
const RE = /^\/api\/files\/(models|previews)\/([a-f0-9-]{36}\.(?:rbxm|png|jpg|webp))$/;

export const parseStoredUrl = (url) => {
  const m = RE.exec(url || '');
  return m ? { kind: m[1], name: m[2] } : null;
};
export const filePath = (kind, name) => path.join(ROOT, kind, name);

export async function removeStored(url) {
  const p = parseStoredUrl(url);
  if (p) await fs.unlink(filePath(p.kind, p.name)).catch(() => {});
}
