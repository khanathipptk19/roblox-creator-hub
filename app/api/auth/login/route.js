import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json().catch(() => ({}));
    if (!email || !password) return NextResponse.json({ error: 'กรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [String(email).toLowerCase().trim()]);
    const user = rows[0];
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    await createSession(user);
    return NextResponse.json({ ok: true, role: user.role });
  } catch (e) {
    console.error('LOGIN ERROR:', e);
    return NextResponse.json({ error: `เซิร์ฟเวอร์ผิดพลาด: ${e.message}` }, { status: 500 });
  }
}
