import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req, { params }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const [r] = await pool.query(
    "UPDATE asset_candidates SET status='rejected', reviewed_by=?, reviewed_at=NOW() WHERE id=? AND status='pending'",
    [admin.id, Number(params.id)]);
  if (r.affectedRows === 0) return NextResponse.json({ error: 'รายการนี้ถูกตรวจไปแล้ว' }, { status: 409 });
  return NextResponse.json({ ok: true });
}
