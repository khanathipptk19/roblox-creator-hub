import { pool } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'บัญชีของฉัน' };

export default async function Profile() {
  const s = await getSession();
  const [rows] = await pool.query('SELECT email, name, role, created_at FROM users WHERE id = ?', [s.id]);
  const u = rows[0];
  const perms = [
    ['ดูเส้นทางเริ่มต้น คลังสคริปต์ และโมเดลฟรี', true, true],
    ['คัดลอกโค้ดและดาวน์โหลดไฟล์ .luau / .rbxm', true, true],
    ['เพิ่ม แก้ไข ลบ เนื้อหา', false, true],
    ['จัดการบัญชีผู้ใช้และเปลี่ยนบทบาท', false, true],
  ];
  return (
    <>
      <h1>บัญชีของฉัน</h1>
      <dl className="profileCard">
        <div><dt>ชื่อ</dt><dd>{u.name}</dd></div>
        <div><dt>อีเมล</dt><dd>{u.email}</dd></div>
        <div><dt>บทบาท</dt><dd>{u.role === 'admin' ? 'แอดมิน' : 'ผู้ใช้'}</dd></div>
        <div><dt>สมัครเมื่อ</dt><dd>{new Date(u.created_at).toISOString().slice(0, 10)}</dd></div>
      </dl>
      <h2>สิทธิ์ของแต่ละบทบาท</h2>
      <table className="permTable">
        <thead><tr><th>การใช้งาน</th><th>ผู้ใช้</th><th>แอดมิน</th></tr></thead>
        <tbody>
          {perms.map(([t, a, b]) => (
            <tr key={t}><td>{t}</td><td className={a ? 'yes' : 'no'}>{a ? 'ทำได้' : 'ทำไม่ได้'}</td><td className={b ? 'yes' : 'no'}>{b ? 'ทำได้' : 'ทำไม่ได้'}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
