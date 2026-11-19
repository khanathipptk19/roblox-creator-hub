'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, STYLES } from '@/lib/utils';

function Candidate({ c }) {
  const router = useRouter();
  const [f, setF] = useState({ ...c.fields });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value });

  async function act(kind) {
    setBusy(true); setMsg('');
    const res = await fetch(`/api/admin/candidates/${c.id}/${kind}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: f }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg(j.error || 'ผิดพลาด'); setBusy(false); return; }
    router.refresh();
  }

  return (
    <article className="candidate">
      <p className="muted">
        จาก: {c.source_name || 'ไม่ระบุแหล่ง'}{' '}
        {c.post_url && <a href={c.post_url} target="_blank" rel="noopener noreferrer nofollow">เปิดโพสต์ต้นฉบับ</a>}
      </p>
      {f.notes && <p className="warnBox">ข้อสังเกตจาก AI: {f.notes}</p>}
      <details>
        <summary>ดูข้อความต้นฉบับที่วาง</summary>
        <pre className="rawText">{c.raw_text}</pre>
      </details>
      <div className="candGrid">
        <label>ชื่อโมเดล<input value={f.name || ''} onChange={set('name')} /></label>
        <label>ผู้สร้าง (เครดิต)<input value={f.creator_credit || ''} onChange={set('creator_credit')} /></label>
        <label>หมวด
          <select value={f.category} onChange={set('category')}>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>สไตล์
          <select value={f.style} onChange={set('style')}>
            {Object.entries(STYLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>Toolbox ID (ตัวเลข)<input value={f.toolbox_id || ''} onChange={set('toolbox_id')} inputMode="numeric" /></label>
        <label>Tris<input type="number" value={f.tris ?? ''} onChange={set('tris')} /></label>
        <label className="wide">แท็ก<input value={f.tags || ''} onChange={set('tags')} /></label>
        <label className="wide">คำอธิบาย<textarea rows={3} value={f.description || ''} onChange={set('description')} /></label>
        <label className="chk"><input type="checkbox" checked={!!f.streaming_enabled} onChange={set('streaming_enabled')} /> รองรับ StreamingEnabled</label>
      </div>
      {msg && <p className="err" role="alert">{msg}</p>}
      <div className="actions">
        <button className="btn" disabled={busy} onClick={() => act('approve')}>อนุมัติ (เข้าคลังสถานะ "รอสแกน")</button>
        <button className="btn danger" disabled={busy} onClick={() => act('reject')}>ปฏิเสธ</button>
      </div>
    </article>
  );
}

export default function QueueManager({ sources, pending, history, used, limit, hasKey }) {
  const router = useRouter();
  const [form, setForm] = useState({ source_id: '', post_url: '', raw_text: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(''); setOk('');
    const res = await fetch('/api/admin/candidates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(j.error || 'ผิดพลาด');
    setOk(j.count ? `AI พบ ${j.count} รายการ รอตรวจด้านล่าง` : 'AI ไม่พบโมเดลในข้อความนี้');
    setForm({ ...form, raw_text: '', post_url: '' });
    router.refresh();
  }

  return (
    <>
      {!hasKey && <p className="warnBox">ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY ใน .env.local จึงยังเรียก AI ไม่ได้</p>}
      <form className="adminForm" onSubmit={submit}>
        <h2>วางโพสต์ใหม่</h2>
        <p className="muted">วันนี้ใช้ AI แล้ว {used} / {limit} ครั้ง</p>
        <label>แหล่งที่มา
          <select value={form.source_id} onChange={(e) => setForm({ ...form, source_id: e.target.value })}>
            <option value="">ไม่ระบุ</option>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label>ลิงก์โพสต์ (ถ้ามี ต้องขึ้นต้น https://)
          <input value={form.post_url} onChange={(e) => setForm({ ...form, post_url: e.target.value })} />
        </label>
        <label>ข้อความโพสต์ (คัดลอกมาวาง ไม่เกิน 8,000 ตัวอักษร)
          <textarea rows={8} value={form.raw_text} onChange={(e) => setForm({ ...form, raw_text: e.target.value })} required />
        </label>
        {err && <p className="err" role="alert">{err}</p>}
        {ok && <p className="okMsg" role="status">{ok}</p>}
        <button className="btn" disabled={busy || !hasKey}>{busy ? 'AI กำลังวิเคราะห์...' : 'ให้ AI จัดข้อมูล'}</button>
      </form>

      <h2>รอตรวจ ({pending.length})</h2>
      <p className="warnBox">ตรวจเทียบกับโพสต์ต้นฉบับก่อนอนุมัติทุกครั้ง AI อาจอ่านผิด การอนุมัติจะเข้าคลังในสถานะ "รอสแกน" เท่านั้น ต้องตรวจสคริปต์เองก่อนเปลี่ยนเป็นผ่าน</p>
      {pending.length === 0 ? <p className="muted">ไม่มีรายการรอตรวจ</p> : pending.map((c) => <Candidate key={c.id} c={c} />)}

      <h2>ประวัติล่าสุด</h2>
      <div className="tableWrap">
        <table className="dataTable">
          <thead><tr><th>ชื่อ</th><th>ผลการตรวจ</th><th>ผู้ตรวจ</th><th>เวลา</th></tr></thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id}><td>{h.name}</td><td>{h.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}</td><td>{h.reviewer || 'ไม่ทราบ'}</td><td>{h.at}</td></tr>
            ))}
            {history.length === 0 && <tr><td colSpan={4} className="muted">ยังไม่มีประวัติ</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
