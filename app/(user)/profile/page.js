import { pool } from '@/lib/db';
import { getSession } from '@/lib/auth';
import ProfileForms from './ProfileForms';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'บัญชีของฉัน' };

export default async function Profile() {
  const s = await getSession();
  const [rows] = await pool.query(
    'SELECT email, name, role, roblox_username, discord_tag, bio, created_at FROM users WHERE id = ?',
    [s.id]
  );
  const u = rows[0];

  return (
    <>
      <h1>บัญชีของฉัน</h1>

      {/* ข้อมูลสรุปบัญชี */}
      <dl className="profileCard">
        <div><dt>ชื่อ</dt><dd>{u.name}</dd></div>
        <div><dt>อีเมล</dt><dd>{u.email}</dd></div>
        <div><dt>ชื่อ Roblox</dt><dd>{u.roblox_username || '-'}</dd></div>
        <div><dt>Discord</dt><dd>{u.discord_tag || '-'}</dd></div>
        <div><dt>บทบาท</dt><dd>{u.role === 'admin' ? 'แอดมิน' : 'ผู้ใช้'}</dd></div>
        <div><dt>สมัครเมื่อ</dt><dd>{new Date(u.created_at).toISOString().slice(0, 10)}</dd></div>
        {u.bio && <div><dt>แนะนำตัว</dt><dd>{u.bio}</dd></div>}
      </dl>

      {/* ฟอร์มแก้ไขข้อมูลและเปลี่ยนรหัสผ่าน */}
      <ProfileForms user={u} />
    </>
  );
}