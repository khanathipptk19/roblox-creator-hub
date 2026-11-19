'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const KEY = 'creatorhub:roadmap';
const internal = (u) => typeof u === 'string' && u.startsWith('/') && !u.startsWith('//');

export default function RoadmapSteps({ steps }) {
  const [done, setDone] = useState({});
  const [open, setOpen] = useState({});
  const [hovered, setHovered] = useState(null);

  useEffect(() => { try { setDone(JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {} }, []);

  function toggle(id) {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }

  function toggleOpen(id) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const count = steps.filter((s) => done[s.id]).length;
  const isAllComplete = steps.length > 0 && count === steps.length;
  const isAnyOpen = steps.some((s) => open[s.id]);

  function toggleAll() {
    if (isAnyOpen) {
      setOpen({});
    } else {
      const all = {};
      steps.forEach((s) => { all[s.id] = true; });
      setOpen(all);
    }
  }

  if (steps.length === 0) return <p className="muted">ยังไม่มีขั้นตอน แอดมินเพิ่มได้ที่หน้าจัดการเนื้อหา</p>;
  return (
    <>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={count}>
        <span
          style={{
            width: `${(count / steps.length) * 100}%`,
            background: isAllComplete ? '#10b981' : undefined,
            transition: 'width 0.4s ease, background 0.3s ease',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        <p className="muted" style={{ margin: 0 }}>
          {isAllComplete
            ? '🎉 ยินดีด้วย! คุณเรียนครบทั้ง 6 ขั้นตอนแล้ว พร้อมสร้างเกมได้เลย!'
            : `เรียนจบแล้ว ${count} จาก ${steps.length} ขั้น (บันทึกในเบราว์เซอร์ของคุณ)`}
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="btn small"
          style={{ background: 'transparent', border: '1px solid #374151', color: '#d1d5db' }}
        >
          {isAnyOpen ? 'ย่อทั้งหมด' : 'ขยายทั้งหมด'}
        </button>
      </div>

      <ol className="roadmap">
        {steps.map((s) => {
          const isOpen = !!open[s.id];
          const isHover = hovered === s.id;
          return (
            <li
              key={s.id}
              id={`step-${s.step_no}`}
              className={`rmStep ${done[s.id] ? 'done' : ''}`}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                transform: isHover ? 'translateY(-2px)' : 'none',
                borderColor: isHover || isOpen ? '#f59e0b' : undefined,
                boxShadow: isHover ? '0 8px 24px rgba(245, 158, 11, 0.12)' : undefined,
              }}
            >
              <div
                className="rmHead"
                onClick={() => toggleOpen(s.id)}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleOpen(s.id);
                  }
                }}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <span className="stepNum">{String(s.step_no).padStart(2, '0')}</span>
                <div style={{ flex: 1 }}>
                  <h3>{s.title}</h3>
                  <ul className="metaChips">
                    {s.level && <li>ระดับ: {s.level}</li>}
                    {s.duration && <li>ใช้เวลาประมาณ {s.duration}</li>}
                    {done[s.id] && <li style={{ color: '#10b981', borderColor: '#10b981' }}>✓ เรียนจบแล้ว</li>}
                  </ul>
                </div>

                <span
                  aria-hidden="true"
                  style={{
                    color: isHover || isOpen ? '#fbbf24' : '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease, color 0.2s ease',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>

              {isOpen && (
                <div style={{ marginTop: '16px' }}>
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
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}