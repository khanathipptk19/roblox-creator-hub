'use client';
import { useEffect, useRef, useState } from 'react';
import AuthForm from './AuthForm';

// ป็อปอัปล็อกอิน/สมัครสมาชิก แสดงทับหน้าแรกทันทีที่ผู้เยี่ยมชมที่ยังไม่ล็อกอินเข้าเว็บ
// closable={false} = ปิดไม่ได้จนกว่าจะล็อกอิน
export default function AuthModal({ closable = true }) {
  const [open, setOpen] = useState(true);
  const [mode, setMode] = useState('login');
  const [next, setNext] = useState('');
  const dialog = useRef(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('auth') === 'register') setMode('register');
    const n = p.get('next');
    if (n) setNext(n);
    const onOpen = (e) => { setMode(e.detail?.mode === 'register' ? 'register' : 'login'); setOpen(true); };
    window.addEventListener('open-auth', onOpen);
    return () => window.removeEventListener('open-auth', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape' && closable) { setOpen(false); return; }
      if (e.key !== 'Tab' || !dialog.current) return;
      // ให้โฟกัสวนอยู่ในป็อปอัป
      const list = [...dialog.current.querySelectorAll('button, [href], input, select, textarea')]
        .filter((el) => !el.disabled && el.offsetParent !== null);
      if (!list.length) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open, closable]);

  if (!open) return null;
  return (
    <div className="authOverlay" onMouseDown={(e) => { if (closable && e.target === e.currentTarget) setOpen(false); }}>
      <div className="authDialog" role="dialog" aria-modal="true" aria-labelledby="authTitle" ref={dialog}>
        {closable && <button type="button" className="authClose" aria-label="ปิดหน้าต่าง" onClick={() => setOpen(false)}>×</button>}
        <div className="authTabs" role="tablist" aria-label="เข้าสู่ระบบหรือสมัครสมาชิก">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>เข้าสู่ระบบ</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'on' : ''} onClick={() => setMode('register')}>สมัครสมาชิก</button>
        </div>
        <AuthForm key={mode} mode={mode} embedded nextUrl={next} />
      </div>
    </div>
  );
}
