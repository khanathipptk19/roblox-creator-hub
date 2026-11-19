import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import AdminNav from '@/components/AdminNav';
import LogoutButton from '@/components/LogoutButton';

export default async function AdminLayout({ children }) {
  const s = await requireAdmin();
  if (!s) redirect('/');
  return (
    <div className="adminShell">
      <aside className="side">
        <div className="sideBrand">Creator Hub<small>แผงควบคุมแอดมิน</small></div>
        <AdminNav />
        <div className="sideFoot"><span>{s.name}</span><LogoutButton /></div>
      </aside>
      <main className="adminMain">{children}</main>
    </div>
  );
}
