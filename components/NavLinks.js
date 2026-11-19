'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLinks({ isAdmin }) {
  const path = usePathname();
  const links = [
    ['/', 'เส้นทางเริ่มต้น'],
    ['/learn', 'เรียนภาษา Luau'],
    ['/scripts', 'คลังสคริปต์'],
    ['/assets', 'โมเดลฟรี'],
    ['/profile', 'บัญชีของฉัน'],
    ...(isAdmin ? [['/admin', 'แผงแอดมิน']] : []),
  ];
  return (
    <nav className="navLinks" aria-label="เมนูหลัก">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className={path === href ? 'active' : ''} aria-current={path === href ? 'page' : undefined}>{label}</Link>
      ))}
    </nav>
  );
}
