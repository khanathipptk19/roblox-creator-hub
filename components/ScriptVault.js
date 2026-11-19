'use client';
import { useState } from 'react';
import ScriptCard from './ScriptCard';

export default function ScriptVault({ scripts }) {
  const cats = [...new Set(scripts.map((s) => s.category).filter(Boolean))];
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const list = scripts.filter((s) =>
    (cat === 'all' || s.category === cat) &&
    (!q || `${s.title} ${s.description || ''} ${s.category || ''}`.toLowerCase().includes(q.toLowerCase()))
  );
  const featured = list.filter((s) => s.is_featured);
  const rest = list.filter((s) => !s.is_featured);

  return (
    <>
      <div className="vaultBar">
        <div className="tabs" role="tablist" aria-label="หมวดสคริปต์">
          {['all', ...cats].map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>
              {c === 'all' ? `ทั้งหมด (${scripts.length})` : c}
            </button>
          ))}
        </div>
        <input type="search" className="searchBox" placeholder="กรองตามชื่อสคริปต์..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="กรองสคริปต์" />
      </div>
      {list.length === 0 && <p className="muted">ไม่พบสคริปต์ที่ตรงกับการค้นหา</p>}
      {featured.map((s) => <ScriptCard key={s.id} script={s} />)}
      {rest.length > 0 && <div className="grid3">{rest.map((s) => <ScriptCard key={s.id} script={s} compact />)}</div>}
    </>
  );
}
