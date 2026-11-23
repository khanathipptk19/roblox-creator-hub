import Link from 'next/link';
import { pool } from '@/lib/db';
import { parseJson, CATEGORIES, STYLES, DIFFICULTY } from '@/lib/utils';
import RoadmapSteps from '@/components/RoadmapSteps';
import Checklist from '@/components/Checklist';
import { getSession } from '@/lib/auth';
import OpenAuthButton from '@/components/OpenAuthButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'เส้นทางเริ่มต้น' };

const imgOk = (u) => /^(https?:\/\/|\/(?!\/))/.test(u || '');
const STATUS = { safe: ['ok', 'ผ่านการตรวจ'], pending: ['wait', 'รอสแกน'], flagged: ['bad', 'ห้ามใช้'] };

// จัดอันดับจากจำนวนผู้ใช้ที่เคยคัดลอก/ดาวน์โหลด ถ้ายังไม่มีตาราง item_usage ให้ถอยไปใช้ลำดับแนะนำ
async function popularScripts() {
  try {
    const [r] = await pool.query(
      `SELECT s.*, (SELECT COUNT(*) FROM item_usage u WHERE u.kind = 'script' AND u.item_id = s.id) AS uses
       FROM scripts s ORDER BY uses DESC, s.is_featured DESC, s.sort_order, s.id LIMIT 3`);
    return r;
  } catch {
    const [r] = await pool.query('SELECT s.*, 0 AS uses FROM scripts s ORDER BY s.is_featured DESC, s.sort_order, s.id LIMIT 3');
    return r;
  }
}
async function popularAssets() {
  try {
    const [r] = await pool.query(
      `SELECT a.*, (SELECT COUNT(*) FROM item_usage u WHERE u.kind = 'asset' AND u.item_id = a.id) AS uses
       FROM assets a WHERE a.scan_status <> 'flagged'
       ORDER BY uses DESC, (a.scan_status = 'safe') DESC, a.id DESC LIMIT 4`);
    return r;
  } catch {
    const [r] = await pool.query("SELECT a.*, 0 AS uses FROM assets a WHERE a.scan_status <> 'flagged' ORDER BY (a.scan_status = 'safe') DESC, a.id DESC LIMIT 4");
    return r;
  }
}

export default async function Home() {
  const session = await getSession();
  const isGuest = !session;
  const [rows] = await pool.query('SELECT * FROM roadmap_steps ORDER BY step_no');
  const [items] = await pool.query('SELECT * FROM checklist_items ORDER BY sort_order, id');
  const [[sc]] = await pool.query('SELECT COUNT(*) AS c FROM scripts');
  const [[as]] = await pool.query('SELECT COUNT(*) AS c FROM assets');
  // ผู้เยี่ยมชมที่ยังไม่ล็อกอินเห็นเฉพาะส่วนต้อนรับ (ไม่ส่งโค้ดสคริปต์และรายการโมเดลไปให้)
  const scripts = isGuest ? [] : await popularScripts();
  const assets = isGuest ? [] : await popularAssets();

  const steps = rows.map((s) => ({
    id: s.id, step_no: s.step_no, title: s.title, level: s.level, duration: s.duration, summary: s.summary,
    goals: parseJson(s.goals, []), practice: s.practice, outcome: s.outcome, topics: parseJson(s.topics, []),
    link_url: s.link_url, link_label: s.link_label,
  }));

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Roadmap & Getting Started</p>
          <h1>เริ่มสร้างเกม Roblox ตัวแรกของคุณ แบบถูกวิธี</h1>
          <p className="lead">ไม่ต้องมีพื้นฐานมาก่อน เรียงให้เป็นขั้น ตั้งแต่รู้จักเครื่องมือใน Studio อ่านและเขียนโค้ด Luau ไปจนถึงเผยแพร่เกมให้เพื่อนเล่นได้จริง</p>
          <div className="actions">
            <a className="btn" href="#step-1">เริ่มดูสเต็ปแรก</a>
            <Link className="btn ghost" href="/learn">เปิดบทเรียนภาษา Luau</Link>
          </div>
          <ul className="statChips">
            <li><b>{steps.length}</b><span>ขั้นตอน เรียนต่อเนื่อง</span></li>
            <li><b>{sc.c}</b><span>สคริปต์พร้อมคำอธิบาย</span></li>
            <li><b>{as.c}</b><span>โมเดลในคลัง</span></li>
          </ul>
        </div>
        <div className="heroRight">
          <div className="heroLogoWrap">
            <img
              src="/images/roblox-studio.png"
              alt="Roblox Studio"
              className="floating-studio-logo"
            />
          </div>
        <div className="console" aria-hidden="true">
          <div className="consoleBar">Output</div>
          <pre>{`> Players.PlayerAdded: สวัสดี ผู้สร้างเกม
> KillBrick.Touched ทำงาน
> Humanoid.Health = 0
> เกมของคุณพร้อมเผยแพร่`}</pre>
        </div>
        </div> 
      </section>

      <section aria-labelledby="steps-h">
        <p className="eyebrow">Mastery Roadmap</p>
        <h2 id="steps-h" className="flush">{steps.length || ''} ขั้นตอน จากศูนย์สู่เกมแรกของคุณ</h2>
        <p className="muted">แต่ละขั้นบอกว่าต้องเรียนอะไร ให้ลงมือทำอะไร และผ่านขั้นเมื่อทำอะไรได้</p>
        <RoadmapSteps steps={steps} />
      </section>

      {isGuest ? (
        <section className="guestTeaser" aria-labelledby="guest-h">
          <h2 id="guest-h" className="flush">เข้าสู่ระบบเพื่อปลดล็อกคลังเนื้อหา</h2>
          <p className="muted">สมัครฟรีเพื่อดูคลังสคริปต์พร้อมคำอธิบายทีละบรรทัด โมเดลฟรีที่ผ่านการตรวจ และบทเรียนภาษา Luau</p>
          <div className="actions">
            <OpenAuthButton mode="login" className="btn">เข้าสู่ระบบ</OpenAuthButton>
            <OpenAuthButton mode="register" className="btn ghost">สมัครสมาชิกฟรี</OpenAuthButton>
          </div>
        </section>
      ) : (
        <>
      <section aria-labelledby="pop-scripts-h">
        <div className="sectionHead">
          <div>
            <p className="eyebrow">Popular Scripts</p>
            <h2 id="pop-scripts-h" className="flush">สคริปต์ที่น่าสนใจ</h2>
            <p className="muted">จัดอันดับจากจำนวนผู้ใช้ที่คัดลอกหรือดาวน์โหลด ถ้ายังไม่มีสถิติจะแสดงรายการแนะนำ</p>
          </div>
          <Link className="btn ghost small" href="/scripts">ดูสคริปต์ทั้งหมด</Link>
        </div>
        {scripts.length === 0 ? <p className="muted">ยังไม่มีสคริปต์</p> : (
          <div className="homeGrid">
            {scripts.map((s) => {
              const lines = String(s.code).split('\n');
              const preview = lines.slice(0, 8).join('\n') + (lines.length > 8 ? '\n...' : '');
              const uses = Number(s.uses) || 0;
              return (
                <article key={s.id} className="miniCard">
                  <h3>{s.title}</h3>
                  <ul className="metaChips">
                    {s.category && <li>{s.category}</li>}
                    {s.difficulty && <li>ระดับ: {DIFFICULTY[s.difficulty] || s.difficulty}</li>}
                    {uses > 0 && <li className="hot">{uses} คนใช้งาน</li>}
                  </ul>
                  <p>{s.description}</p>
                  <pre className="codePreview">{preview}</pre>
                  <Link className="btn small" href={`/scripts#script-${s.slug}`}>ดูคำอธิบายทีละบรรทัด</Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="pop-assets-h">
        <div className="sectionHead">
          <div>
            <p className="eyebrow">Trending Models</p>
            <h2 id="pop-assets-h" className="flush">โมเดลยอดฮิต</h2>
            <p className="muted">จัดอันดับจากจำนวนผู้ใช้ที่ดาวน์โหลดหรือนำ Toolbox ID ไปใช้ ถ้ายังไม่มีสถิติจะแสดงโมเดลที่ผ่านการตรวจก่อน</p>
          </div>
          <Link className="btn ghost small" href="/assets">ดูโมเดลทั้งหมด</Link>
        </div>
        {assets.length === 0 ? <p className="muted">ยังไม่มีโมเดลในคลัง</p> : (
          <div className="homeGrid four">
            {assets.map((a) => {
              const [cls, label] = STATUS[a.scan_status] || STATUS.pending;
              const uses = Number(a.uses) || 0;
              return (
                <Link key={a.id} href="/assets" className="miniAsset">
                  <div className={`preview ph-${a.category}`}>
                    {imgOk(a.preview_url) ? <img src={a.preview_url} alt="" loading="lazy" /> : <span className="phLabel">{CATEGORIES[a.category]}</span>}
                    <span className={`badge onImg ${cls}`}>{label}</span>
                    <span className="tris">{a.tris != null ? `${a.tris.toLocaleString()} Tris` : 'GUI'} · {STYLES[a.style] || STYLES.other}</span>
                  </div>
                  <div className="miniAssetBody">
                    <strong>{a.name}</strong>
                    <span className="muted">{CATEGORIES[a.category]}{uses > 0 ? ` · ${uses} คนใช้งาน` : ''}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
        </>
      )}

      <section aria-labelledby="check-h">
        <h2 id="check-h">เช็คลิสต์ก่อนเริ่มเขียนโค้ด</h2>
        <Checklist items={items.map(({ id, label, hint }) => ({ id, label, hint }))} />
      </section>
    </>
  );
}
