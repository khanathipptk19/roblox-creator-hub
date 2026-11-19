'use client';
import { useRef, useState } from 'react';

const USE_BLOB = process.env.NEXT_PUBLIC_STORAGE === 'blob';
const LIMIT = { model: 25 * 1024 * 1024, preview: 3 * 1024 * 1024 };
const IMG_EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

async function uploadLocal(file, kind) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('kind', kind);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || 'อัปโหลดไม่สำเร็จ');
  return j;
}

// Vercel: ไฟล์วิ่งตรงจากเบราว์เซอร์ไป Blob (เลี่ยงเพดาน 4.5 MB ของฟังก์ชัน) แล้วให้เซิร์ฟเวอร์ตรวจ/สแกนต่อ
async function uploadBlob(file, kind) {
  const ext = kind === 'model' ? 'rbxm' : IMG_EXT[file.type];
  if (!ext) throw new Error(kind === 'model' ? 'ต้องเป็นไฟล์ .rbxm' : 'รองรับเฉพาะรูป PNG, JPG, WEBP');
  if (file.size > LIMIT[kind]) throw new Error(`ไฟล์ใหญ่เกิน ${LIMIT[kind] / 1024 / 1024} MB`);
  const folder = kind === 'model' ? 'models' : 'previews';
  const pathname = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { upload } = await import('@vercel/blob/client');
  await upload(pathname, file, {
    access: 'private',
    handleUploadUrl: '/api/admin/blob-token',
    contentType: kind === 'model' ? 'application/octet-stream' : file.type,
  });
  const res = await fetch('/api/admin/upload/finish', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pathname, original: file.name }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || 'ตรวจไฟล์ไม่สำเร็จ');
  return j;
}

export default function UploadField({ label, kind, accept, value, onChange, onResult, hint }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  async function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr('');
    try {
      const j = USE_BLOB ? await uploadBlob(file, kind) : await uploadLocal(file, kind);
      setInfo(`${j.original} (${Math.max(1, Math.round(j.size / 1024))} KB)`);
      onChange(j.url);
      if (onResult) onResult(j);
    } catch (ex) {
      setErr(ex.message || 'อัปโหลดไม่สำเร็จ');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
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
