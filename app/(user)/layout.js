import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { getSession } from '@/lib/auth';

export default async function UserLayout({ children }) {
  const session = await getSession();
  const isAdmin = session?.role === 'admin';
  return (
    <>
      <Navbar session={session} />
      {isAdmin && (
        <div className="banner adminView">
          คุณกำลังดูในมุมมองผู้ใช้ <Link href="/admin">กลับแผงแอดมิน</Link>
        </div>
      )}
      <main className="container">{children}</main>
      {!session && <AuthModal />}
    </>
  );
}