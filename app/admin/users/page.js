import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import UsersTable from '@/components/UsersTable';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'ผู้ใช้งาน' };

export default async function UsersPage() {
  const me = await requireAdmin();
  const [rows] = await pool.query('SELECT id, email, name, role, created_at FROM users ORDER BY id');
  return (
    <>
      <h1>ผู้ใช้งาน</h1>
      <p className="muted">เปลี่ยนบทบาทหรือลบบัญชีได้ ยกเว้นบัญชีของตัวเอง</p>
      <UsersTable meId={me.id} rows={JSON.parse(JSON.stringify(rows))} />
    </>
  );
}
