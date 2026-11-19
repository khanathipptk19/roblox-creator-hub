import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { cleanItem } from '@/lib/ai';

export async function POST(req, { params }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const f = cleanItem(body.fields || {});
  if (!f.name) return NextResponse.json({ error: 'ต้องมีชื่อโมเดล' }, { status: 400 });

  const [rows] = await pool.query(
    'SELECT c.id, c.status, r.source_id, r.post_url FROM asset_candidates c JOIN ai_runs r ON r.id = c.run_id WHERE c.id = ?', [id]);
  const c = rows[0];
  if (!c) return NextResponse.json({ error: 'ไม่พบรายการ' }, { status: 404 });
  if (c.status !== 'pending') return NextResponse.json({ error: 'รายการนี้ถูกตรวจไปแล้ว' }, { status: 409 });

  // เข้าคลังเป็น "รอสแกน" เสมอ ไม่ว่า AI หรือโพสต์จะอ้างว่าปลอดภัย
  const report = JSON.stringify({ backdoor: 'na', require_assetid: 'na', obfuscated: 'na', remote_spam: 'na', lag_bombs: 'na', note: 'นำเข้าจากโพสต์ รอการสแกน' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [ins] = await conn.query(
      `INSERT INTO assets (category, name, description, source_id, source_post_url, creator_credit, toolbox_id, tris,
        scan_status, scan_report, style, streaming_enabled, tags, creator_verified)
       VALUES (?,?,?,?,?,?,?,?, 'pending', ?, ?,?,?, 0)`,
      [f.category, f.name, f.description || null, c.source_id, c.post_url, f.creator_credit || null,
       f.toolbox_id || null, f.tris, report, f.style, f.streaming_enabled, f.tags || null]);
    const [upd] = await conn.query(
      "UPDATE asset_candidates SET status='approved', asset_id=?, reviewed_by=?, reviewed_at=NOW() WHERE id=? AND status='pending'",
      [ins.insertId, admin.id, id]);
    if (upd.affectedRows === 0) { await conn.rollback(); return NextResponse.json({ error: 'รายการนี้ถูกตรวจไปแล้ว' }, { status: 409 }); }
    await conn.commit();
    return NextResponse.json({ ok: true, asset_id: ins.insertId });
  } catch (e) {
    await conn.rollback();
    console.error('APPROVE ERROR:', e);
    return NextResponse.json({ error: 'บันทึกไม่สำเร็จ ตรวจว่ารัน upgrade_content.sql แล้ว' }, { status: 500 });
  } finally {
    conn.release();
  }
}
