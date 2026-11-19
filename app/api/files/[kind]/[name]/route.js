import fs from 'fs/promises';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession, requireAdmin } from '@/lib/auth';
import { filePath } from '@/lib/storage';

export const runtime = 'nodejs';
const TYPES = { rbxm: 'application/octet-stream', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };

export async function GET(req, { params }) {
  const { kind, name } = params;
  if (!['models', 'previews'].includes(kind) || !/^[a-f0-9-]{36}\.(rbxm|png|jpg|webp)$/.test(name)) {
    return new NextResponse('Not found', { status: 404 });
  }
  if (!(await getSession())) return new NextResponse('Unauthorized', { status: 401 });

  let downloadName = 'model';
  if (kind === 'models') {
    const admin = await requireAdmin();
    const [rows] = await pool.query('SELECT name, scan_status FROM assets WHERE file_url = ?', [`/api/files/models/${name}`]);
    const a = rows[0];
    // ผู้ใช้ทั่วไปโหลดได้เฉพาะโมเดลที่แอดมินตั้งสถานะ "ผ่านการตรวจ" แล้ว
    if (!admin && (!a || a.scan_status !== 'safe')) return new NextResponse('Not found', { status: 404 });
    if (a) downloadName = a.name;
  }

  let buf;
  try { buf = await fs.readFile(filePath(kind, name)); } catch { return new NextResponse('Not found', { status: 404 }); }

  const headers = {
    'Content-Type': TYPES[name.split('.').pop()],
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'private, max-age=3600',
  };
  if (kind === 'models') {
    const base = `${String(downloadName).replace(/[\\/:*?"<>|\r\n]+/g, ' ').trim().slice(0, 80) || 'model'}.rbxm`;
    headers['Content-Disposition'] = `attachment; filename="model.rbxm"; filename*=UTF-8''${encodeURIComponent(base)}`;
  }
  return new Response(buf, { headers });
}
