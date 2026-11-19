import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { pool } from './db';

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET);
export const COOKIE = 'session';

export async function createSession(user) {
  const token = await new SignJWT({ role: user.role, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setExpirationTime('7d')
    .sign(secret());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { id: Number(payload.sub), name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}

// ตรวจบทบาทกับฐานข้อมูลทุกครั้งที่แก้ข้อมูล (กันกรณีถูกลดสิทธิ์แต่ token ยังไม่หมดอายุ)
export async function requireAdmin() {
  const s = await getSession();
  if (!s) return null;
  const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [s.id]);
  return rows[0]?.role === 'admin' ? s : null;
}
