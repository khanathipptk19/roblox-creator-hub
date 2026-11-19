import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { type, id } = await req.json().catch(() => ({}));
  const kind = type === 'script' ? 'script' : type === 'asset' ? 'asset' : null;
  const item = Number(id);
  if (!kind || !Number.isInteger(item) || item <= 0) return NextResponse.json({ error: 'bad request' }, { status: 400 });

  // แอดมินใช้ทดสอบ ไม่นับ เพื่อไม่ให้บิดเบือนอันดับ
  if (s.role === 'admin') return NextResponse.json({ ok: true, counted: false });

  try {
    const sql = kind === 'script'
      ? 'SELECT id FROM scripts WHERE id = ?'
      : "SELECT id FROM assets WHERE id = ? AND scan_status <> 'flagged'";
    const [rows] = await pool.query(sql, [item]);
    if (!rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
    // 1 คนนับ 1 ครั้งต่อ 1 ชิ้น (INSERT IGNORE ชนคีย์หลักแล้วข้าม)
    await pool.query('INSERT IGNORE INTO item_usage (user_id, kind, item_id) VALUES (?,?,?)', [s.id, kind, item]);
    return NextResponse.json({ ok: true, counted: true });
  } catch (e) {
    console.error('TRACK ERROR:', e?.message);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
