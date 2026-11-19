'use client';
import { useState } from 'react';
import useCrud from './useCrud';
import UploadField from './UploadField';
import { CATEGORIES, STYLES, parseJson } from '@/lib/utils';

const CHECKS = [
  ['backdoor', 'Backdoor'], ['require_assetid', 'require(AssetId)'], ['obfuscated', 'โค้ด Obfuscated'],
  ['remote_spam', 'RemoteEvent Spammer'], ['lag_bombs', 'Hidden Fire / Lag Bomb'],
];
const RESULT = { na: 'ยังไม่ตรวจ', clean: 'ไม่พบ', warn: 'ควรตรวจเอง', found: 'พบ' };
const CHIP = { clean: 'ok', found: 'bad', warn: 'wait', na: 'wait' };
const STATUS_TH = { pending: 'รอสแกน', safe: 'ผ่านการตรวจ', flagged: 'ห้ามใช้' };
const NA = Object.fromEntries(CHECKS.map(([k]) => [k, 'na']));

const EMPTY = {
  name: '', category: 'buildings', file_url: '', toolbox_id: '', preview_url: '', description: '', source_id: '',
  style: 'other', tags: '', tris: '', mesh_optimized: '', creator_credit: '', source_post_url: '',
  streaming_enabled: 0, creator_verified: 0, scan_status: 'pending', checks: NA, note: '', findings: [], auto: null,
};

function fromRow(r) {
  const rep = parseJson(r.scan_report, {});
  const v = (x) => x ?? '';
  return {
    name: v(r.name), category: r.category, file_url: v(r.file_url), toolbox_id: v(r.toolbox_id), preview_url: v(r.preview_url),
    description: v(r.description), source_id: v(r.source_id), style: r.style || 'other', tags: v(r.tags), tris: v(r.tris),
    mesh_optimized: v(r.mesh_optimized), creator_credit: v(r.creator_credit), source_post_url: v(r.source_post_url),
    streaming_enabled: r.streaming_enabled ? 1 : 0, creator_verified: r.creator_verified ? 1 : 0, scan_status: r.scan_status,
    checks: Object.fromEntries(CHECKS.map(([k]) => [k, rep[k] || 'na'])), note: rep.note || '',
    findings: Array.isArray(rep.findings) ? rep.findings : [], auto: rep.auto || null,
  };
}

function toPayload(f) {
  const found = CHECKS.filter(([k]) => f.checks[k] === 'found').length;
  const allClean = CHECKS.every(([k]) => f.checks[k] === 'clean');
  const report = { ...f.checks, note: f.note };
  if (found) report.malicious_scripts = found; else if (allClean) report.malicious_scripts = 0;
  if (f.findings.length) report.findings = f.findings.slice(0, 30);
  if (f.auto) report.auto = f.auto;
  const { checks, note, findings, auto, ...rest } = f;
  return { ...rest, scan_report: JSON.stringify(report) };
}

export default function AssetEditor({ rows, refs = {} }) {
  const { save, remove, msg, setMsg } = useCrud('assets');
  const [id, setId] = useState(null);
  const [f, setF] = useState(EMPTY);
  const [scanning, setScanning] = useState(false);
  const sources = refs.asset_sources || [];
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value });
  const setCheck = (k) => (e) => setF({ ...f, checks: { ...f.checks, [k]: e.target.value } });

  function edit(row) { setId(row.id); setF(fromRow(row)); setMsg({ type: '', text: '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function reset() { setId(null); setF(EMPTY); }

  // ไฟล์ใหม่ = ยังไม่เคยรีวิว จึงรีเซ็ตเป็น "รอสแกน" เสมอ ถ้าพบความเสี่ยงสูงให้ตั้ง "ห้ามใช้" ทันที
  function applyScan(scan) {
    const hasFound = Object.values(scan.checks).includes('found');
    setF((s) => ({ ...s, checks: scan.checks, findings: scan.findings || [], auto: scan.auto, scan_status: hasFound ? 'flagged' : 'pending' }));
    setMsg({ type: hasFound ? 'err' : 'ok', text: hasFound ? 'สแกนพบความเสี่ยง ตั้งเป็น "ห้ามใช้" ให้แล้ว ดูรายละเอียดด้านล่าง' : 'สแกนเสร็จแล้ว ตรวจผลด้านล่างก่อนกดบันทึก' });
  }
  async function rescan() {
    setScanning(true);
    const res = await fetch('/api/admin/scan-file', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: f.file_url }) });
    const j = await res.json().catch(() => ({}));
    setScanning(false);
    if (!res.ok) return setMsg({ type: 'err', text: j.error || 'สแกนไม่สำเร็จ' });
    applyScan(j.scan);
  }

  async function submit(e) {
    e.preventDefault();
    if (!f.name.trim()) return setMsg({ type: 'err', text: 'กรอกชื่อโมเดล' });
    if (!f.file_url && !String(f.toolbox_id).trim()) return setMsg({ type: 'err', text: 'ต้องมีไฟล์ .rbxm หรือ Toolbox ID อย่างน้อยหนึ่งอย่าง' });
    if (await save(id, toPayload(f))) reset();
  }

  const hasFound = Object.values(f.checks).includes('found');

  return (
    <div className="adminGrid">
      <form onSubmit={submit} className="adminForm">
        <h2>{id ? 'แก้ไขโมเดล' : 'เพิ่มโมเดลใหม่'}</h2>

        <label>ชื่อโมเดล *<input value={f.name} onChange={set('name')} /></label>
        <label>หมวด *
          <select value={f.category} onChange={set('category')}>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>

        <UploadField label="ไฟล์โมเดล (.rbxm ไม่เกิน 25 MB) ระบบสแกนให้อัตโนมัติหลังอัปโหลด" kind="model" accept=".rbxm" value={f.file_url}
          onChange={(u) => setF((s) => (u ? { ...s, file_url: u } : { ...s, file_url: '', auto: null, findings: [], checks: NA, scan_status: 'pending' }))}
          onResult={(j) => j.scan && applyScan(j.scan)}
          hint="หรือกรอก Toolbox ID แทนก็ได้ (ต้องมีอย่างน้อยหนึ่งอย่าง)" />

        {f.file_url && (
          <div className="scanResult">
            <div className="scanHead">
              <strong>ผลสแกนไฟล์</strong>
              {f.auto && <small className="muted">{f.auto.format === 'xml' ? 'XML' : 'ไบนารี'} · สคริปต์ {f.auto.scripts} ตัว · วัตถุ {f.auto.instances} ชิ้น · {f.auto.complete ? 'อ่านไฟล์ครบ' : 'อ่านไฟล์ได้ไม่ครบ'}</small>}
            </div>
            {f.auto?.warnings?.map((w) => <p key={w} className="warnBox">{w}</p>)}
            {f.auto ? (
              <ul className="chkList">
                {CHECKS.map(([k, label]) => <li key={k}><span>{label}</span><b className={CHIP[f.checks[k]]}>{RESULT[f.checks[k]]}</b></li>)}
              </ul>
            ) : <p className="muted">ยังไม่มีผลสแกนของไฟล์นี้ กดปุ่มสแกนด้านล่าง</p>}
            {f.findings.length > 0 && (
              <details open>
                <summary>รายละเอียดที่พบ ({f.findings.length})</summary>
                <ul className="findings">
                  {f.findings.map((x, i) => <li key={i} className={x.level}>{x.script}{x.line ? ` บรรทัด ${x.line}` : ''}: {x.message}</li>)}
                </ul>
              </details>
            )}
            <p className="muted">สถานะตอนนี้: <b>{STATUS_TH[f.scan_status]}</b></p>
            <div className="actions">
              <button type="button" className="btn ghost small" disabled={scanning} onClick={rescan}>{scanning ? 'กำลังสแกน...' : 'สแกนไฟล์อีกครั้ง'}</button>
              <button type="button" className="btn small" disabled={hasFound || !f.auto?.complete || f.scan_status === 'safe'}
                onClick={() => { setF((s) => ({ ...s, scan_status: 'safe' })); setMsg({ type: 'ok', text: 'ตั้งเป็น "ผ่านการตรวจ" แล้ว กดบันทึกเพื่อยืนยัน' }); }}>
                ตั้งเป็น "ผ่านการตรวจ"
              </button>
            </div>
            <p className="muted">สแกนด้วยกฎตรวจจับรูปแบบที่พบบ่อย ไม่ใช่การรับรองความปลอดภัย เปิดดูสคริปต์ในโมเดลเองก่อนกดผ่านทุกครั้ง</p>
          </div>
        )}

        <label>Toolbox ID (ตัวเลข)<input inputMode="numeric" value={f.toolbox_id} onChange={set('toolbox_id')} /></label>

        <UploadField label="รูปตัวอย่าง (PNG / JPG / WEBP ไม่เกิน 3 MB)" kind="preview" accept="image/png,image/jpeg,image/webp" value={f.preview_url}
          onChange={(u) => setF((s) => ({ ...s, preview_url: u }))} />

        <label>คำอธิบายสั้น ๆ<textarea rows={2} value={f.description} onChange={set('description')} /></label>
        <label>แหล่งที่มา (กลุ่ม/เพจ)
          <select value={f.source_id} onChange={set('source_id')}>
            <option value="">ไม่ระบุ</option>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>

        <details className="more">
          <summary>ตัวเลือกเพิ่มเติม (ไม่บังคับ)</summary>
          <label>เครดิตผู้สร้าง<input value={f.creator_credit} onChange={set('creator_credit')} /></label>
          <label>ลิงก์โพสต์ต้นทาง (https://)<input value={f.source_post_url} onChange={set('source_post_url')} /></label>
          <label>สไตล์กราฟิก
            <select value={f.style} onChange={set('style')}>
              {Object.entries(STYLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label>แท็ก (คั่นด้วยจุลภาค)<input value={f.tags} onChange={set('tags')} placeholder="low-poly, city" /></label>
          <label>จำนวน Tris<input type="number" min="0" value={f.tris} onChange={set('tris')} /></label>
          <label>ผล Mesh Optimization<input value={f.mesh_optimized} onChange={set('mesh_optimized')} /></label>
          <label className="chk"><input type="checkbox" checked={!!f.streaming_enabled} onChange={set('streaming_enabled')} /> รองรับ StreamingEnabled</label>
          <label className="chk"><input type="checkbox" checked={!!f.creator_verified} onChange={set('creator_verified')} /> ผู้สร้างผ่านการยืนยันโดยแอดมิน</label>

          <fieldset className="scanBox">
            <legend>แก้ผลตรวจด้วยมือ (หลังเปิดอ่านสคริปต์เองแล้ว)</legend>
            <label>สถานะ
              <select value={f.scan_status} onChange={set('scan_status')}>
                {Object.entries(STATUS_TH).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <p className="muted">ผู้ใช้ทั่วไปโหลดไฟล์ได้เฉพาะสถานะ "ผ่านการตรวจ"</p>
            {CHECKS.map(([k, label]) => (
              <label key={k} className="inlineSel">{label}
                <select value={f.checks[k]} onChange={setCheck(k)}>
                  {Object.entries(RESULT).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                </select>
              </label>
            ))}
            <label>หมายเหตุถึงผู้ใช้<input value={f.note} onChange={set('note')} /></label>
          </fieldset>
        </details>

        {msg.text && <p className={msg.type === 'ok' ? 'okMsg' : 'err'} role="status">{msg.text}</p>}
        <div className="actions">
          <button className="btn">{id ? 'บันทึกการแก้ไข' : 'เพิ่มโมเดล'}</button>
          {id && <button type="button" className="btn ghost" onClick={reset}>ยกเลิก</button>}
        </div>
      </form>

      <ul className="adminList">
        {rows.map((r) => (
          <li key={r.id}>
            <span>{r.name} <small className="muted">· {STATUS_TH[r.scan_status]}{r.file_url ? ' · มีไฟล์' : ''}</small></span>
            <span className="actions">
              <button className="btn ghost small" onClick={() => edit(r)}>แก้ไข</button>
              <button className="btn danger small" onClick={async () => { if (await remove(r.id, r.name) && id === r.id) reset(); }}>ลบ</button>
            </span>
          </li>
        ))}
        {rows.length === 0 && <li className="muted">ยังไม่มีโมเดล</li>}
      </ul>
    </div>
  );
}
