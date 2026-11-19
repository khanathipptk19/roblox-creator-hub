import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { TABLES } from '@/lib/tables';
import { removeStored } from '@/lib/storage';

class VErr extends Error {}
const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

async function guard(table) {
  if (!(await requireAdmin())) return [null, NextResponse.json({ error: 'forbidden' }, { status: 403 })];
  const cfg = TABLES[table];
  if (!cfg) return [null, NextResponse.json({ error: 'ไม่พบตาราง' }, { status: 404 })];
  return [cfg, null];
}

// เก็บเฉพาะช่องที่ส่งมา ช่องที่ไม่ส่งจะไม่ถูกแตะ (ใช้ค่าเดิม/ค่าเริ่มต้นของฐานข้อมูล)
function clean(cfg, body) {
  const out = {};
  for (const f of cfg.fields) {
    if (!(f.name in body)) continue;
    let v = body[f.name];
    const empty = v === '' || v == null;
    if (f.type === 'number' || f.type === 'ref') {
      if (empty) { if (f.nullable) out[f.name] = null; continue; }
      v = Number(v);
      if (!Number.isFinite(v)) throw new VErr(`${f.label}: ต้องเป็นตัวเลข`);
    } else if (f.type === 'check') {
      v = v ? 1 : 0;
    } else if (f.type === 'json') {
      if (empty) v = null;
      else { try { JSON.parse(v); } catch { throw new VErr(`${f.label}: รูปแบบ JSON ไม่ถูกต้อง`); } }
    } else if (f.type === 'select') {
      if (empty) continue;
      if (!f.options.includes(v)) throw new VErr(`${f.label}: ค่าไม่ถูกต้อง`);
    } else {
      v = empty ? null : (f.type === 'textarea' ? String(v) : String(v).trim());
      if (v === '') v = null;
    }
    if (f.required && (v == null || v === '')) throw new VErr(`${f.label}: จำเป็นต้องกรอก`);
    if (f.pattern && typeof v === 'string' && !new RegExp(f.pattern).test(v)) throw new VErr(`${f.label}: รูปแบบไม่ถูกต้อง`);
    out[f.name] = v;
  }
  return out;
}

async function fixSlug(data, id) {
  let slug = slugify(data.slug);
  if (!slug && !id) slug = slugify(data.title) || `script-${Date.now().toString(36)}`;
  if (!slug) { delete data.slug; return; }
  let cand = slug, n = 1;
  for (;;) {
    const [r] = await pool.query('SELECT id FROM scripts WHERE slug = ? AND id <> ?', [cand, id || 0]);
    if (!r.length) break;
    n += 1; cand = `${slug.slice(0, 70)}-${n}`;
  }
  data.slug = cand;
}

// กันตั้งเป็น "ผ่านการตรวจ" ทั้งที่รายงานระบุว่าพบความเสี่ยง
function checkAsset(data) {
  if (data.scan_status !== 'safe' || !data.scan_report) return;
  let r = {};
  try { r = JSON.parse(data.scan_report); } catch {}
  const bad = Object.entries(r).some(([k, v]) => v === 'found' || (k === 'malicious_scripts' && Number(v) > 0));
  if (bad) throw new VErr('รายงานระบุว่าพบความเสี่ยง จึงตั้งสถานะเป็น "ผ่านการตรวจ" ไม่ได้');
}

async function run(fn) {
  try { return NextResponse.json(await fn()); }
  catch (e) {
    if (e instanceof VErr) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'บันทึกไม่สำเร็จ ตรวจว่ากรอกช่องบังคับครบและรัน SQL อัปเกรดแล้ว' }, { status: 400 });
  }
}

export async function POST(req, { params }) {
  const [cfg, err] = await guard(params.table);
  if (err) return err;
  const body = await req.json().catch(() => ({}));
  return run(async () => {
    const data = clean(cfg, body);
    if (params.table === 'scripts') await fixSlug(data, null);
    if (params.table === 'assets') checkAsset(data);
    const [r] = await pool.query('INSERT INTO ?? SET ?', [params.table, data]);
    return { ok: true, id: r.insertId };
  });
}

export async function PUT(req, { params }) {
  const [cfg, err] = await guard(params.table);
  if (err) return err;
  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  return run(async () => {
    const data = clean(cfg, body);
    if (params.table === 'scripts') await fixSlug(data, id);
    if (params.table === 'assets') checkAsset(data);
    let old;
    if (params.table === 'assets') [[old]] = await pool.query('SELECT file_url, preview_url FROM assets WHERE id = ?', [id]);
    await pool.query('UPDATE ?? SET ? WHERE id = ?', [params.table, data, id]);
    if (old) for (const k of ['file_url', 'preview_url']) if (k in data && old[k] && old[k] !== data[k]) await removeStored(old[k]);
    return { ok: true };
  });
}

export async function DELETE(req, { params }) {
  const [cfg, err] = await guard(params.table);
  if (err) return err;
  const { id } = await req.json().catch(() => ({}));
  return run(async () => {
    let old;
    if (params.table === 'assets') [[old]] = await pool.query('SELECT file_url, preview_url FROM assets WHERE id = ?', [Number(id)]);
    await pool.query('DELETE FROM ?? WHERE id = ?', [params.table, Number(id)]);
    if (old) { await removeStored(old.file_url); await removeStored(old.preview_url); }
    return { ok: true };
  });
}
