import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id, role } = await req.json().catch(() => ({}));
  if (!['user', 'admin'].includes(role)) return NextResponse.json({ error: 'บทบาทไม่ถูกต้อง' }, { status: 400 });
  if (Number(id) === admin.id) return NextResponse.json({ error: 'ห้ามเปลี่ยนบทบาทของตัวเอง' }, { status: 400 });
  await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, Number(id)]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await req.json().catch(() => ({}));
  if (Number(id) === admin.id) return NextResponse.json({ error: 'ห้ามลบบัญชีของตัวเอง' }, { status: 400 });
  await pool.query('DELETE FROM users WHERE id = ?', [Number(id)]);
  return NextResponse.json({ ok: true });
}
