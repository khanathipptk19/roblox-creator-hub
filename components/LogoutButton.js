'use client';
export default function LogoutButton() {
  async function out() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }
  return <button className="btn ghost small" onClick={out}>ออกจากระบบ</button>;
}
