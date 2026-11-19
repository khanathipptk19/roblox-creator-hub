import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, name, password } = await req.json().catch(() => ({}));
    const em = String(email || '').toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(em)) return NextResponse.json({ error: 'อีเมลไม่ถูกต้อง' }, { status: 400 });
    if (!name || String(name).trim().length < 2) return NextResponse.json({ error: 'กรอกชื่ออย่างน้อย 2 ตัวอักษร' }, { status: 400 });
    if (!password || password.length < 8) return NextResponse.json({ error: 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [em]);
    if (exists.length) return NextResponse.json({ error: 'อีเมลนี้ถูกใช้แล้ว' }, { status: 409 });
    const hash = await bcrypt.hash(password, 12);
    // สมัครใหม่เป็น 'user' เสมอ ห้ามรับ role จากฝั่งผู้ใช้
    const [r] = await pool.query('INSERT INTO users (email, name, password_hash, role) VALUES (?,?,?,?)', [em, String(name).trim(), hash, 'user']);
    await createSession({ id: r.insertId, name: String(name).trim(), role: 'user' });
    return NextResponse.json({ ok: true, role: 'user' });
  } catch (e) {
    console.error('REGISTER ERROR:', e);
    return NextResponse.json({ error: `เซิร์ฟเวอร์ผิดพลาด: ${e.message}` }, { status: 500 });
  }
}
