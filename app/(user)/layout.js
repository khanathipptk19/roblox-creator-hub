import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getSession } from '@/lib/auth';

export default async function UserLayout({ children }) {
  const session = await getSession();
  const isAdmin = session?.role === 'admin';
  return (
    <>
      <Navbar session={session} />
      <div className={isAdmin ? 'banner adminView' : 'banner'}>
        {isAdmin ? (
          <>คุณกำลังดูในมุมมองผู้ใช้ <Link href="/admin">กลับแผงแอดมิน</Link></>
        ) : (
          <>โหมดผู้ชม: ดู คัดลอก และดาวน์โหลดได้ แต่แก้ไขข้อมูลไม่ได้</>
        )}
      </div>
      <main className="container">{children}</main>
    </>
  );
}
