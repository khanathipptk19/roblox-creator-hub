'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const res = await fetch(`/api/auth/${mode}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setError(j.error || `เกิดข้อผิดพลาด (รหัส ${res.status})`); setBusy(false); return; }
    window.location.href = j.role === 'admin' ? '/admin' : '/';
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="authWrap">
      <form className="authCard" onSubmit={submit}>
        <h1>{isRegister ? 'สร้างบัญชีผู้เล่น' : 'เข้าสู่ระบบ'}</h1>
        {isRegister && (<label>ชื่อที่แสดง<input value={form.name} onChange={set('name')} required /></label>)}
        <label>อีเมล<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>รหัสผ่าน<input type="password" value={form.password} onChange={set('password')} required minLength={isRegister ? 8 : 1} /></label>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</button>
        <p className="muted">
          {isRegister ? 'มีบัญชีแล้ว? ' : 'ยังไม่มีบัญชี? '}
          <Link href={isRegister ? '/login' : '/register'}>{isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</Link>
        </p>
      </form>
    </div>
  );
}
