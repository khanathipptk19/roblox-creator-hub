import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'แดชบอร์ดแอดมิน' };

async function count(sql) { const [r] = await pool.query(sql); return r[0].c; }

export default async function Dashboard() {
  const stats = [
    ['ผู้ใช้ทั้งหมด', await count('SELECT COUNT(*) c FROM users')],
    ['แอดมิน', await count("SELECT COUNT(*) c FROM users WHERE role='admin'")],
    ['สคริปต์', await count('SELECT COUNT(*) c FROM scripts')],
    ['โมเดล', await count('SELECT COUNT(*) c FROM assets')],
    ['โมเดลที่ถูกติดธง', await count("SELECT COUNT(*) c FROM assets WHERE scan_status='flagged'")],
    ['โมเดลรอตรวจจาก AI', await count("SELECT COUNT(*) c FROM asset_candidates WHERE status='pending'")],
    ['โมเดลรอสแกน', await count("SELECT COUNT(*) c FROM assets WHERE scan_status='pending'")],
  ];
  const [latest] = await pool.query('SELECT name, email, role, created_at FROM users ORDER BY id DESC LIMIT 5');
  return (
    <>
      <h1>แดชบอร์ด</h1>
      <div className="stats">
        {stats.map(([l, n]) => <div key={l} className="stat"><b>{n}</b><span>{l}</span></div>)}
      </div>
      <h2>ผู้สมัครล่าสุด</h2>
      <table className="dataTable">
        <thead><tr><th>ชื่อ</th><th>อีเมล</th><th>บทบาท</th><th>สมัครเมื่อ</th></tr></thead>
        <tbody>
          {latest.map((u) => (
            <tr key={u.email}><td>{u.name}</td><td>{u.email}</td><td>{u.role === 'admin' ? 'แอดมิน' : 'ผู้ใช้'}</td><td>{new Date(u.created_at).toISOString().slice(0, 10)}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
