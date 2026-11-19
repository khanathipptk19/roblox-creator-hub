'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function AdminNav() {
  const path = usePathname();
  const items = [
    ['/admin', 'แดชบอร์ด'],
    ['/admin/content', 'จัดการเนื้อหา'],
    ['/admin/queue', 'คิวรอตรวจ (AI)'],
    ['/admin/users', 'ผู้ใช้งาน'],
    ['/admin/scanner', 'ตัวตรวจสคริปต์'],
  ];
  return (
    <nav className="sideNav" aria-label="เมนูแอดมิน">
      {items.map(([href, label]) => (
        <Link key={href} href={href} className={path === href ? 'active' : ''}>{label}</Link>
      ))}
      <Link href="/" className="viewAs">ดูมุมมองผู้ใช้</Link>
    </nav>
  );
}
