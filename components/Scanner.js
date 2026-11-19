'use client';
import { useState } from 'react';

export default function Scanner() {
  const [src, setSrc] = useState('');
  const [res, setRes] = useState(null);
  async function run() {
    const r = await fetch('/api/admin/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: src }) });
    setRes((await r.json()).findings);
  }
  return (
    <div className="adminForm">
      <h2>ตรวจสคริปต์เบื้องต้น</h2>
      <p className="muted">วางโค้ดจากโมเดลเพื่อหารูปแบบเสี่ยง (require(AssetId), loadstring, Obfuscated) เป็นการตรวจด้วยกฎ ไม่ใช่การรับรองความปลอดภัย ควรเปิดอ่านโค้ดเองก่อนเปลี่ยนสถานะเป็น safe</p>
      <textarea rows={12} className="mono" value={src} onChange={(e) => setSrc(e.target.value)} />
      <div className="actions"><button className="btn" onClick={run}>สแกน</button></div>
      {res && (res.length === 0 ? <p className="okMsg">ไม่พบรูปแบบเสี่ยงตามกฎที่มี</p> : (
        <ul className="findings">{res.map((f, i) => <li key={i} className={f.level}>บรรทัด {f.line}: {f.message}</li>)}</ul>
      ))}
    </div>
  );
}
