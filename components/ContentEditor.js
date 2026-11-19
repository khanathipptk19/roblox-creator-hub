'use client';
import { useState } from 'react';
import useCrud from './useCrud';
import { TABLES } from '@/lib/tables';
import { parseJson } from '@/lib/utils';

const toForm = (cfg, row) => Object.fromEntries(cfg.fields.map((f) => {
  let v = row ? row[f.name] : undefined;
  if (f.type === 'list') v = parseJson(v, []).join(', ');
  else if (f.type === 'lines') v = parseJson(v, []).join('\n');
  else if (f.type === 'check') v = v ? 1 : 0;
  else if (f.type === 'select') v = v ?? f.options[0];
  else v = v ?? '';
  return [f.name, v];
}));

export default function ContentEditor({ table, rows, refs = {} }) {
  const cfg = TABLES[table];
  const { save, remove, msg, setMsg } = useCrud(table);
  const [form, setForm] = useState(toForm(cfg));
  const [id, setId] = useState(null);

  const edit = (row) => { setId(row.id); setForm(toForm(cfg, row)); setMsg({ type: '', text: '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => { setId(null); setForm(toForm(cfg)); };

  async function submit(e) {
    e.preventDefault();
    const payload = { ...form };
    for (const f of cfg.fields) {
      if (f.type === 'list' || f.type === 'lines') {
        const arr = String(form[f.name]).split(f.type === 'list' ? /[,\n]/ : /\n/).map((s) => s.trim()).filter(Boolean);
        payload[f.name] = arr.length ? JSON.stringify(arr) : '';
      }
    }
    if (await save(id, payload)) reset();
  }

  return (
    <div className="adminGrid">
      <form onSubmit={submit} className="adminForm">
        <h2>{id ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</h2>
        {cfg.fields.map((f) => (
          <label key={f.name}>{f.label}{f.required ? ' *' : ''}
            {f.type === 'textarea' || f.type === 'lines' ? (
              <textarea rows={f.type === 'lines' ? 6 : 3} value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
            ) : f.type === 'ref' ? (
              <select value={form[f.name] ?? ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
                <option value="">ไม่ระบุ</option>
                {(refs[f.ref] || []).map((o) => <option key={o.id} value={o.id}>{o[f.refLabel]}</option>)}
              </select>
            ) : f.type === 'select' ? (
              <select value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : f.type === 'check' ? (
              <input type="checkbox" checked={!!form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.checked ? 1 : 0 })} />
            ) : (
              <input type={f.type === 'number' ? 'number' : 'text'} placeholder={f.hint} value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
            )}
          </label>
        ))}
        {msg.text && <p className={msg.type === 'ok' ? 'okMsg' : 'err'} role="status">{msg.text}</p>}
        <div className="actions">
          <button className="btn">{id ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}</button>
          {id && <button type="button" className="btn ghost" onClick={reset}>ยกเลิก</button>}
        </div>
      </form>
      <ul className="adminList">
        {rows.map((r) => (
          <li key={r.id}>
            <span>{r[cfg.titleField]}</span>
            <span className="actions">
              <button className="btn ghost small" onClick={() => edit(r)}>แก้ไข</button>
              <button className="btn danger small" onClick={async () => { if (await remove(r.id, r[cfg.titleField]) && id === r.id) reset(); }}>ลบ</button>
            </span>
          </li>
        ))}
        {rows.length === 0 && <li className="muted">ยังไม่มีข้อมูล</li>}
      </ul>
    </div>
  );
}
