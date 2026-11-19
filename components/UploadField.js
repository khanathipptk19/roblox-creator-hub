'use client';
import { useRef, useState } from 'react';

export default function UploadField({ label, kind, accept, value, onChange, onResult, hint }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  async function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('kind', kind);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (input.current) input.current.value = '';
    if (!res.ok) return setErr(j.error || 'อัปโหลดไม่สำเร็จ');
    setInfo(`${j.original} (${Math.max(1, Math.round(j.size / 1024))} KB)`);
    onChange(j.url);
    if (onResult) onResult(j);
  }

  return (
    <div className="uploadField">
      <span className="uploadLabel">{label}</span>
      {value && kind === 'preview' && <img className="uploadThumb" src={value} alt="รูปตัวอย่าง" />}
      {value && (
        <p className="muted">
          {info || 'มีไฟล์แล้ว'}{' '}
          <button type="button" className="linkBtn" onClick={() => { onChange(''); setInfo(''); }}>เอาไฟล์ออก</button>
        </p>
      )}
      <input ref={input} type="file" accept={accept} onChange={pick} disabled={busy} />
      {busy && <p className="muted">กำลังอัปโหลด...</p>}
      {hint && <small className="muted">{hint}</small>}
      {err && <p className="err" role="alert">{err}</p>}
    </div>
  );
}
