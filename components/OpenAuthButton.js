'use client';

// ปุ่มสำหรับเปิดป็อปอัปล็อกอิน/สมัครสมาชิกจากที่ไหนก็ได้ในหน้า (สื่อสารกับ AuthModal ผ่านอีเวนต์)
export default function OpenAuthButton({ mode = 'login', className = 'btn', children }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: { mode } }))}
    >
      {children}
    </button>
  );
}
