'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
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
        <label>
          รหัสผ่าน
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              required
              minLength={isRegister ? 8 : 1}
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </label>
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