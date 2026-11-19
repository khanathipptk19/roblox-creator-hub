'use client';
import { useEffect, useState } from 'react';

const KEY = 'creatorhub:checklist';

export default function Checklist({ items }) {
  const [done, setDone] = useState({});
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {}
  }, []);
  function toggle(id) {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }
  const count = items.filter((i) => done[i.id]).length;
  return (
    <div className="check">
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={count}>
        <span style={{ width: `${items.length ? (count / items.length) * 100 : 0}%` }} />
      </div>
      <p className="muted">พร้อมแล้ว {count} จาก {items.length} ข้อ (บันทึกในเบราว์เซอร์ของคุณ)</p>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <label>
              <input type="checkbox" checked={!!done[i.id]} onChange={() => toggle(i.id)} />
              <span><strong>{i.label}</strong>{i.hint && <small>{i.hint}</small>}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
