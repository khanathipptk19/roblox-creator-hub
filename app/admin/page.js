import Link from 'next/link';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { CATEGORIES } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'แดชบอร์ดแอดมิน' };

// ตารางบางตัว (เช่น item_usage, ai_runs) อาจยังไม่ถูกสร้าง จึงให้ query ล้มเหลวได้โดยไม่ทำให้ทั้งหน้าพัง
async function q(sql, fallback = []) {
  try { const [r] = await pool.query(sql); return r; } catch (e) { console.error('DASH:', e?.message); return fallback; }
}
const num = async (sql) => Number((await q(sql, [{ c: 0 }]))[0]?.c ?? 0);

const STATUS = { safe: ['ok', 'ผ่านการตรวจ'], pending: ['wait', 'รอสแกน'], flagged: ['bad', 'ห้ามใช้'] };
const CAT_COLOR = { buildings: '#6aa8ff', vehicles: '#c58cf0', props: '#f2b53c', nature: '#7fd39a', gui: '#5cc8d6', model: '#f08fa5' };

function lastDays(todayIso, n) {
  const [y, m, d] = todayIso.split('-').map(Number);
  const base = Date.UTC(y, m - 1, d);
  return Array.from({ length: n }, (_, i) => new Date(base - (n - 1 - i) * 86400000).toISOString().slice(0, 10));
}

function Card({ title, link, linkText, span = 4, children }) {
  return (
    <section className={`dashCard span-${span}`}>
      <header>
        <h2>{title}</h2>
        {link && <Link href={link}>{linkText || 'ดูทั้งหมด'}</Link>}
      </header>
      {children}
    </section>
  );
}

function Stat({ label, value, sub, href, tone = '' }) {
  return (
    <Link href={href} className={`dashStat ${tone}`}>
      <span>{label}</span>
      <b>{value.toLocaleString()}</b>
      {sub && <small>{sub}</small>}
    </Link>
  );
}

function Rank({ rows, empty }) {
  const list = rows.filter((r) => Number(r.uses) > 0);
  if (!list.length) return <p className="muted">{empty}</p>;
  const max = Math.max(...list.map((r) => Number(r.uses)));
  return (
    <ol className="rankList">
      {list.map((r, i) => (
        <li key={r.id}>
          <span className="rankNo">{i + 1}</span>
          <span className="rankName">{r.name}</span>
          <span className="rankBar"><i style={{ width: `${(Number(r.uses) / max) * 100}%` }} /></span>
          <b>{Number(r.uses)}</b>
        </li>
      ))}
    </ol>
  );
}

export default async function Dashboard() {
  const session = await getSession();
  const [today] = (await q("SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS d", [{ d: new Date().toISOString().slice(0, 10) }])).map((r) => r.d);

  const [
    users, admins, scripts, assets, safe, flagged, scanPending, candPending, usage, aiToday,
    signupRows, catRows, flaggedList, pendingList, topScripts, topAssets, latestUsers, latestAssets,
  ] = await Promise.all([
    num('SELECT COUNT(*) c FROM users'),
    num("SELECT COUNT(*) c FROM users WHERE role = 'admin'"),
    num('SELECT COUNT(*) c FROM scripts'),
    num('SELECT COUNT(*) c FROM assets'),
    num("SELECT COUNT(*) c FROM assets WHERE scan_status = 'safe'"),
    num("SELECT COUNT(*) c FROM assets WHERE scan_status = 'flagged'"),
    num("SELECT COUNT(*) c FROM assets WHERE scan_status = 'pending'"),
    num("SELECT COUNT(*) c FROM asset_candidates WHERE status = 'pending'"),
    num('SELECT COUNT(*) c FROM item_usage'),
    num('SELECT COUNT(*) c FROM ai_runs WHERE created_at >= CURDATE()'),
    q("SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, COUNT(*) AS c FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')"),
    q('SELECT category, COUNT(*) AS c FROM assets GROUP BY category ORDER BY c DESC'),
    q("SELECT id, name FROM assets WHERE scan_status = 'flagged' ORDER BY id DESC LIMIT 3"),
    q("SELECT id, name FROM assets WHERE scan_status = 'pending' ORDER BY id DESC LIMIT 3"),
    q("SELECT s.id, s.title AS name, (SELECT COUNT(*) FROM item_usage u WHERE u.kind = 'script' AND u.item_id = s.id) AS uses FROM scripts s ORDER BY uses DESC, s.id LIMIT 5"),
    q("SELECT a.id, a.name, (SELECT COUNT(*) FROM item_usage u WHERE u.kind = 'asset' AND u.item_id = a.id) AS uses FROM assets a ORDER BY uses DESC, a.id DESC LIMIT 5"),
    q("SELECT name, email, role, DATE_FORMAT(created_at, '%Y-%m-%d') AS d FROM users ORDER BY id DESC LIMIT 6"),
    q("SELECT id, name, category, scan_status, DATE_FORMAT(created_at, '%Y-%m-%d') AS d FROM assets ORDER BY id DESC LIMIT 6"),
  ]);

  // กราฟผู้สมัครใหม่ 14 วัน (เติม 0 ให้วันที่ไม่มีคนสมัคร)
  const days = lastDays(today, 14);
  const byDay = Object.fromEntries(signupRows.map((r) => [r.d, Number(r.c)]));
  const series = days.map((d) => ({ d, c: byDay[d] || 0 }));
  const maxC = Math.max(1, ...series.map((x) => x.c));
  const total14 = series.reduce((a, x) => a + x.c, 0);
  const total7 = series.slice(-7).reduce((a, x) => a + x.c, 0);

  const catMax = Math.max(1, ...catRows.map((r) => Number(r.c)));
  const pct = (n) => (assets ? (n / assets) * 100 : 0);

  const aiLimit = Number(process.env.AI_DAILY_LIMIT || 30);
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  const storageMode = process.env.NEXT_PUBLIC_STORAGE === 'blob' ? 'Vercel Blob (private)' : 'ในเครื่อง (โฟลเดอร์ storage/)';
  const thaiDate = new Date(`${today}T00:00:00Z`).toLocaleDateString('th-TH', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
  const todo = flagged + scanPending + candPending;

  return (
    <>
      <div className="dashHead">
        <div>
          <h1>แดชบอร์ด</h1>
          <p className="muted">สวัสดี {session?.name || 'แอดมิน'} · ภาพรวมของเว็บ ณ วันที่ {thaiDate}</p>
        </div>
        <div className="dashActions">
          <Link className="btn small" href="/admin/content?t=scripts">เพิ่มสคริปต์</Link>
          <Link className="btn small" href="/admin/content?t=assets">เพิ่มโมเดล</Link>
          <Link className="btn ghost small" href="/admin/queue">วางโพสต์ให้ AI จัดข้อมูล</Link>
          <Link className="btn ghost small" href="/admin/users">จัดการผู้ใช้</Link>
        </div>
      </div>

      <div className="dashStats">
        <Stat label="ผู้ใช้ทั้งหมด" value={users} sub={`แอดมิน ${admins} · ผู้ใช้ทั่วไป ${users - admins}`} href="/admin/users" />
        <Stat label="ผู้สมัครใหม่ 7 วัน" value={total7} sub={`14 วันล่าสุด ${total14} คน`} href="/admin/users" tone={total7 > 0 ? 'ok' : ''} />
        <Stat label="สคริปต์" value={scripts} href="/admin/content?t=scripts" />
        <Stat label="โมเดลทั้งหมด" value={assets} sub={`ผ่านการตรวจ ${safe}`} href="/admin/content?t=assets" />
        <Stat label="โมเดลติดธงแดง" value={flagged} sub={flagged ? 'ต้องตรวจสอบ' : 'ไม่มีรายการค้าง'} href="/admin/content?t=assets" tone={flagged ? 'bad' : 'ok'} />
        <Stat label="โมเดลรอสแกน" value={scanPending} sub={scanPending ? 'ผู้ใช้ยังโหลดไฟล์ไม่ได้' : 'ไม่มีรายการค้าง'} href="/admin/content?t=assets" tone={scanPending ? 'warn' : 'ok'} />
        <Stat label="รอตรวจจาก AI" value={candPending} sub={candPending ? 'รออนุมัติ' : 'ไม่มีรายการค้าง'} href="/admin/queue" tone={candPending ? 'warn' : 'ok'} />
        <Stat label="การใช้งานสะสม" value={usage} sub="นับ 1 คน/ชิ้น ไม่รวมแอดมิน" href="/admin" />
      </div>

      <div className="dashGrid">
        <Card title="ผู้สมัครใหม่ 14 วันล่าสุด" link="/admin/users" linkText="จัดการผู้ใช้" span={7}>
          <div className="barChart" role="img" aria-label={`ผู้สมัครใหม่ 14 วันล่าสุดรวม ${total14} คน`}>
            {series.map((x) => (
              <div key={x.d} className="barCol" title={`${x.d}: ${x.c} คน`}>
                <span className="barVal">{x.c || ''}</span>
                <i className="bar" style={{ height: `${x.c ? Math.max(8, Math.round((x.c / maxC) * 100)) : 3}px` }} />
                <span className="barLbl">{x.d.slice(8)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="ต้องจัดการ" span={5}>
          {todo === 0 && hasKey ? (
            <p className="allClear">ทุกอย่างเรียบร้อย ไม่มีรายการค้าง</p>
          ) : (
            <ul className="todoList">
              {flagged > 0 && (
                <li className="bad">
                  <Link href="/admin/content?t=assets"><b>{flagged}</b> โมเดลติดธงแดง</Link>
                  <small>{flaggedList.map((x) => x.name).join(', ')}</small>
                </li>
              )}
              {scanPending > 0 && (
                <li className="warn">
                  <Link href="/admin/content?t=assets"><b>{scanPending}</b> โมเดลรอสแกน/รอยืนยัน</Link>
                  <small>{pendingList.map((x) => x.name).join(', ')}</small>
                </li>
              )}
              {candPending > 0 && (
                <li className="warn">
                  <Link href="/admin/queue"><b>{candPending}</b> รายการรอตรวจจาก AI</Link>
                  <small>กดอนุมัติหรือปฏิเสธในคิว</small>
                </li>
              )}
              {!hasKey && (
                <li className="warn">
                  <span>ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY</span>
                  <small>ระบบ AI จัดข้อมูลโพสต์ยังใช้ไม่ได้</small>
                </li>
              )}
            </ul>
          )}
        </Card>

        <Card title="โมเดลแยกตามหมวด" link="/admin/content?t=assets" span={4}>
          {catRows.length === 0 ? <p className="muted">ยังไม่มีโมเดล</p> : (
            <ul className="hbars">
              {catRows.map((r) => (
                <li key={r.category}>
                  <span>{CATEGORIES[r.category] || r.category}</span>
                  <span className="hTrack"><i style={{ width: `${(Number(r.c) / catMax) * 100}%`, background: CAT_COLOR[r.category] || 'var(--accent)' }} /></span>
                  <b>{Number(r.c)}</b>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="สถานะการตรวจโมเดล" span={4}>
          {assets === 0 ? <p className="muted">ยังไม่มีโมเดล</p> : (
            <>
              <div className="stackBar" role="img" aria-label={`ผ่าน ${safe} รอสแกน ${scanPending} ห้ามใช้ ${flagged}`}>
                <i className="ok" style={{ width: `${pct(safe)}%` }} />
                <i className="wait" style={{ width: `${pct(scanPending)}%` }} />
                <i className="bad" style={{ width: `${pct(flagged)}%` }} />
              </div>
              <ul className="legend">
                <li><i className="ok" /> ผ่านการตรวจ <b>{safe}</b></li>
                <li><i className="wait" /> รอสแกน <b>{scanPending}</b></li>
                <li><i className="bad" /> ห้ามใช้ <b>{flagged}</b></li>
              </ul>
            </>
          )}
        </Card>

        <Card title="สถานะระบบ" span={4}>
          <ul className="sysList">
            <li><span>ฐานข้อมูล</span><b className="okTxt">เชื่อมต่อได้</b></li>
            <li><span>ที่เก็บไฟล์</span><b>{storageMode}</b></li>
            <li><span>API key ของ AI</span><b className={hasKey ? 'okTxt' : 'warnTxt'}>{hasKey ? 'ตั้งแล้ว' : 'ยังไม่ตั้ง'}</b></li>
            <li>
              <span>AI วันนี้</span>
              <b>{aiToday} / {aiLimit}</b>
            </li>
          </ul>
          <div className="meter" aria-hidden="true"><i style={{ width: `${Math.min(100, (aiToday / Math.max(1, aiLimit)) * 100)}%` }} /></div>
        </Card>

        <Card title="สคริปต์ยอดนิยม" link="/admin/content?t=scripts" span={6}>
          <Rank rows={topScripts} empty="ยังไม่มีสถิติ (นับจากผู้ใช้ทั่วไปที่คัดลอกหรือดาวน์โหลด)" />
        </Card>

        <Card title="โมเดลยอดนิยม" link="/admin/content?t=assets" span={6}>
          <Rank rows={topAssets} empty="ยังไม่มีสถิติ (นับจากผู้ใช้ทั่วไปที่ดาวน์โหลดหรือคัดลอก Toolbox ID)" />
        </Card>

        <Card title="ผู้สมัครล่าสุด" link="/admin/users" span={6}>
          <div className="tableWrap">
            <table className="dataTable compact">
              <thead><tr><th>ชื่อ</th><th>อีเมล</th><th>บทบาท</th><th>สมัครเมื่อ</th></tr></thead>
              <tbody>
                {latestUsers.map((u) => (
                  <tr key={u.email}><td>{u.name}</td><td>{u.email}</td><td>{u.role === 'admin' ? 'แอดมิน' : 'ผู้ใช้'}</td><td>{u.d}</td></tr>
                ))}
                {latestUsers.length === 0 && <tr><td colSpan={4} className="muted">ยังไม่มีผู้ใช้</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="โมเดลที่เพิ่มล่าสุด" link="/admin/content?t=assets" span={6}>
          <div className="tableWrap">
            <table className="dataTable compact">
              <thead><tr><th>ชื่อ</th><th>หมวด</th><th>สถานะ</th><th>เพิ่มเมื่อ</th></tr></thead>
              <tbody>
                {latestAssets.map((a) => {
                  const [cls, label] = STATUS[a.scan_status] || STATUS.pending;
                  return (
                    <tr key={a.id}>
                      <td>{a.name}</td>
                      <td>{CATEGORIES[a.category] || a.category}</td>
                      <td><span className={`badge ${cls}`}>{label}</span></td>
                      <td>{a.d || '-'}</td>
                    </tr>
                  );
                })}
                {latestAssets.length === 0 && <tr><td colSpan={4} className="muted">ยังไม่มีโมเดล</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
