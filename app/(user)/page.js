import Link from 'next/link';
import { pool } from '@/lib/db';
import { parseJson } from '@/lib/utils';
import RoadmapSteps from '@/components/RoadmapSteps';
import Checklist from '@/components/Checklist';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'เส้นทางเริ่มต้น' };

export default async function Home() {
  const [rows] = await pool.query('SELECT * FROM roadmap_steps ORDER BY step_no');
  const [items] = await pool.query('SELECT * FROM checklist_items ORDER BY sort_order, id');
  const [[sc]] = await pool.query('SELECT COUNT(*) AS c FROM scripts');
  const [[as]] = await pool.query('SELECT COUNT(*) AS c FROM assets');

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
        <div className="console" aria-hidden="true">
          <div className="consoleBar">Output</div>
          <pre>{`> Players.PlayerAdded: สวัสดี ผู้สร้างเกม
> KillBrick.Touched ทำงาน
> Humanoid.Health = 0
> เกมของคุณพร้อมเผยแพร่`}</pre>
        </div>
      </section>

      <section aria-labelledby="steps-h">
        <p className="eyebrow">Mastery Roadmap</p>
        <h2 id="steps-h" className="flush">{steps.length || ''} ขั้นตอน จากศูนย์สู่เกมแรกของคุณ</h2>
        <p className="muted">แต่ละขั้นบอกว่าต้องเรียนอะไร ให้ลงมือทำอะไร และผ่านขั้นเมื่อทำอะไรได้</p>
        <RoadmapSteps steps={steps} />
      </section>

      <section aria-labelledby="check-h">
        <h2 id="check-h">เช็คลิสต์ก่อนเริ่มเขียนโค้ด</h2>
        <Checklist items={items.map(({ id, label, hint }) => ({ id, label, hint }))} />
      </section>
    </>
  );
}
