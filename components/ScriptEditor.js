'use client';
import { useState } from 'react';
import useCrud from './useCrud';
import { parseJson } from '@/lib/utils';

const EMPTY = {
  title: '', code: '', placement: '', description: '', category: '', script_type: 'Script', difficulty: 'beginner',
  is_featured: 0, sort_order: '', slug: '', expl: {}, mistakes: [], concepts: [],
};

function PairList({ title, items, onChange, a, b, aPh, bPh }) {
  const set = (i, k, v) => onChange(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div className="pairList">
      <h4>{title}</h4>
      {items.map((it, i) => (
        <div key={i} className="pairRow">
          <input placeholder={aPh} value={it[a] || ''} onChange={(e) => set(i, a, e.target.value)} />
          <input placeholder={bPh} value={it[b] || ''} onChange={(e) => set(i, b, e.target.value)} />
          <button type="button" className="btn ghost small" onClick={() => onChange(items.filter((_, j) => j !== i))}>ลบ</button>
        </div>
      ))}
      <button type="button" className="btn ghost small" onClick={() => onChange([...items, { [a]: '', [b]: '' }])}>เพิ่มแถว</button>
    </div>
  );
}

export default function ScriptEditor({ rows }) {
  const { save, remove, msg, setMsg } = useCrud('scripts');
  const [id, setId] = useState(null);
  const [f, setF] = useState(EMPTY);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value });
  const categories = [...new Set(rows.map((r) => r.category).filter(Boolean))];
  const lines = f.code.split('\n');
  const explained = Object.values(f.expl).filter((t) => t && t.trim()).length;

  function edit(r) {
    setId(r.id); setMsg({ type: '', text: '' });
    setF({
      title: r.title, code: r.code, placement: r.placement || '', description: r.description || '', category: r.category || '',
      script_type: r.script_type || 'Script', difficulty: r.difficulty || 'beginner', is_featured: r.is_featured ? 1 : 0,
      sort_order: r.sort_order ?? '', slug: r.slug || '', expl: parseJson(r.explanations, {}),
      mistakes: parseJson(r.mistakes, []), concepts: parseJson(r.key_concepts, []),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const reset = () => { setId(null); setF(EMPTY); };

  async function submit(e) {
    e.preventDefault();
    if (!f.title.trim()) return setMsg({ type: 'err', text: 'กรอกชื่อสคริปต์' });
    if (!f.code.trim()) return setMsg({ type: 'err', text: 'วางโค้ด Luau' });
    const expl = {};
    lines.forEach((_, i) => { const t = (f.expl[i + 1] || '').trim(); if (t) expl[i + 1] = t; });
    const mistakes = f.mistakes.filter((m) => (m.title || '').trim());
    const concepts = f.concepts.filter((c) => (c.title || '').trim());
    const { expl: _e, mistakes: _m, concepts: _c, ...rest } = f;
    const payload = {
      ...rest,
      explanations: Object.keys(expl).length ? JSON.stringify(expl) : '',
      mistakes: mistakes.length ? JSON.stringify(mistakes) : '',
      key_concepts: concepts.length ? JSON.stringify(concepts) : '',
    };
    if (await save(id, payload)) reset();
  }

  return (
    <div className="adminGrid">
      <form onSubmit={submit} className="adminForm">
        <h2>{id ? 'แก้ไขสคริปต์' : 'เพิ่มสคริปต์ใหม่'}</h2>
        <label>ชื่อสคริปต์ *<input value={f.title} onChange={set('title')} /></label>
        <label>โค้ด Luau *<textarea rows={10} className="mono" value={f.code} onChange={set('code')} spellCheck={false} /></label>
        <label>ตำแหน่งวางสคริปต์<input value={f.placement} onChange={set('placement')} placeholder="Workspace > Part (Script เป็นลูกของ Part)" /></label>
        <label>คำอธิบายสั้น ๆ<textarea rows={2} value={f.description} onChange={set('description')} /></label>

        <details className="more">
          <summary>คำอธิบายรายบรรทัด (ไม่บังคับ) {explained > 0 && <b>· อธิบายแล้ว {explained} บรรทัด</b>}</summary>
          <p className="muted">พิมพ์ข้างบรรทัดที่อยากอธิบาย เว้นว่างบรรทัดที่ไม่ต้องการ ถ้าแก้โค้ดภายหลังให้เช็คเลขบรรทัดอีกครั้ง</p>
          {lines.map((ln, i) => (ln.trim() ? (
            <div key={i} className="explRow">
              <span className="ln">{i + 1}</span>
              <code>{ln.length > 40 ? `${ln.trim().slice(0, 40)}…` : ln.trim()}</code>
              <input value={f.expl[i + 1] || ''} onChange={(e) => setF({ ...f, expl: { ...f.expl, [i + 1]: e.target.value } })} placeholder="อธิบายบรรทัดนี้" />
            </div>
          ) : null))}
        </details>

        <details className="more">
          <summary>ตัวเลือกเพิ่มเติม (ไม่บังคับ)</summary>
          <label>หมวด
            <input list="scriptCats" value={f.category} onChange={set('category')} placeholder="เช่น Kill Part, Leaderstats" />
            <datalist id="scriptCats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label>ประเภทสคริปต์
            <select value={f.script_type} onChange={set('script_type')}>
              <option value="Script">Script (ฝั่งเซิร์ฟเวอร์)</option>
              <option value="LocalScript">LocalScript (ฝั่งผู้เล่น)</option>
              <option value="ModuleScript">ModuleScript</option>
            </select>
          </label>
          <label>ระดับความยาก
            <select value={f.difficulty} onChange={set('difficulty')}>
              <option value="beginner">เริ่มต้น</option>
              <option value="intermediate">ปานกลาง</option>
            </select>
          </label>
          <label className="chk"><input type="checkbox" checked={!!f.is_featured} onChange={set('is_featured')} /> แสดงเป็นสคริปต์เด่น (การ์ดใหญ่)</label>
          <label>ลำดับแสดงผล (เลขน้อยขึ้นก่อน)<input type="number" value={f.sort_order} onChange={set('sort_order')} /></label>
          <PairList title="ข้อผิดพลาดที่พบบ่อย" items={f.mistakes} onChange={(v) => setF({ ...f, mistakes: v })} a="title" b="fix" aPh="ผิดอะไร" bPh="แก้อย่างไร" />
          <PairList title="สาระสำคัญ (Key Concepts)" items={f.concepts} onChange={(v) => setF({ ...f, concepts: v })} a="title" b="text" aPh="หัวข้อ" bPh="อธิบายสั้น ๆ" />
          <label>slug (ระบบสร้างให้เอง ใช้ตั้งชื่อไฟล์ .luau)<input value={f.slug} onChange={set('slug')} /></label>
        </details>

        {msg.text && <p className={msg.type === 'ok' ? 'okMsg' : 'err'} role="status">{msg.text}</p>}
        <div className="actions">
          <button className="btn">{id ? 'บันทึกการแก้ไข' : 'เพิ่มสคริปต์'}</button>
          {id && <button type="button" className="btn ghost" onClick={reset}>ยกเลิก</button>}
        </div>
      </form>

      <ul className="adminList">
        {rows.map((r) => (
          <li key={r.id}>
            <span>{r.title} {r.is_featured ? <small className="muted">· เด่น</small> : null}</span>
            <span className="actions">
              <button className="btn ghost small" onClick={() => edit(r)}>แก้ไข</button>
              <button className="btn danger small" onClick={async () => { if (await remove(r.id, r.title) && id === r.id) reset(); }}>ลบ</button>
            </span>
          </li>
        ))}
        {rows.length === 0 && <li className="muted">ยังไม่มีสคริปต์</li>}
      </ul>
    </div>
  );
}
