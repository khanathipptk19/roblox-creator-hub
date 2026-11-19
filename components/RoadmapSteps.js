'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const KEY = 'creatorhub:roadmap';
const internal = (u) => typeof u === 'string' && u.startsWith('/') && !u.startsWith('//');

export default function RoadmapSteps({ steps }) {
  const [done, setDone] = useState({});
  useEffect(() => { try { setDone(JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {} }, []);
  function toggle(id) {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }
  const count = steps.filter((s) => done[s.id]).length;

  if (steps.length === 0) return <p className="muted">ยังไม่มีขั้นตอน แอดมินเพิ่มได้ที่หน้าจัดการเนื้อหา</p>;
  return (
    <>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={count}>
        <span style={{ width: `${(count / steps.length) * 100}%` }} />
      </div>
      <p className="muted">เรียนจบแล้ว {count} จาก {steps.length} ขั้น (บันทึกในเบราว์เซอร์ของคุณ)</p>

      <ol className="roadmap">
        {steps.map((s) => (
          <li key={s.id} id={`step-${s.step_no}`} className={`rmStep ${done[s.id] ? 'done' : ''}`}>
            <div className="rmHead">
              <span className="stepNum">{String(s.step_no).padStart(2, '0')}</span>
              <div>
                <h3>{s.title}</h3>
                <ul className="metaChips">
                  {s.level && <li>ระดับ: {s.level}</li>}
                  {s.duration && <li>ใช้เวลาประมาณ {s.duration}</li>}
                </ul>
              </div>
            </div>
            {s.summary && <p>{s.summary}</p>}

            <div className="rmCols">
              {s.goals.length > 0 && (
                <div>
                  <h4>สิ่งที่ต้องเรียนรู้</h4>
                  <ul className="goalList">{s.goals.map((g, i) => <li key={i}>{g}</li>)}</ul>
                </div>
              )}
              <div>
                {s.practice && (<><h4>ลงมือทำ</h4><p>{s.practice}</p></>)}
                {s.outcome && (<><h4>ผ่านขั้นนี้เมื่อ</h4><p>{s.outcome}</p></>)}
              </div>
            </div>

            {s.topics.length > 0 && <ul className="chips">{s.topics.map((t) => <li key={t}>{t}</li>)}</ul>}

            <div className="actions">
              {internal(s.link_url) && <Link className="btn small" href={s.link_url}>{s.link_label || 'เปิดดู'}</Link>}
              <label className="chk"><input type="checkbox" checked={!!done[s.id]} onChange={() => toggle(s.id)} /> เรียนจบขั้นนี้แล้ว</label>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
