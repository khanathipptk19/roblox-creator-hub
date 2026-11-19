import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { extractAssets } from '@/lib/ai';

export const maxDuration = 60;

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { source_id, post_url, raw_text } = await req.json().catch(() => ({}));
  const text = String(raw_text || '').trim();
  if (text.length < 20) return NextResponse.json({ error: 'ข้อความสั้นเกินไป' }, { status: 400 });
  if (text.length > 8000) return NextResponse.json({ error: 'ข้อความยาวเกิน 8,000 ตัวอักษร ตัดให้สั้นลง' }, { status: 400 });

  let url = String(post_url || '').trim();
  if (url && !/^https:\/\/\S+$/.test(url)) return NextResponse.json({ error: 'ลิงก์โพสต์ต้องขึ้นต้นด้วย https://' }, { status: 400 });
  if (url.length > 255) return NextResponse.json({ error: 'ลิงก์ยาวเกินไป' }, { status: 400 });
  url = url || null;

  let sid = null, srcName = '';
  if (source_id) {
    const [s] = await pool.query('SELECT id, name FROM asset_sources WHERE id = ?', [Number(source_id)]);
    if (s[0]) { sid = s[0].id; srcName = s[0].name; }
  }

  // จำกัดจำนวนครั้งต่อวัน กันค่าใช้จ่ายบานปลาย (นับทุกครั้งที่เรียก)
  const limit = Number(process.env.AI_DAILY_LIMIT || 30);
  const [[u]] = await pool.query('SELECT COUNT(*) AS c FROM ai_runs WHERE created_at >= CURDATE()');
  if (u.c >= limit) return NextResponse.json({ error: `ใช้ AI ครบ ${limit} ครั้งของวันนี้แล้ว` }, { status: 429 });

  const [run] = await pool.query('INSERT INTO ai_runs (admin_id, source_id, post_url, raw_text) VALUES (?,?,?,?)', [admin.id, sid, url, text]);

  let items;
  try {
    items = await extractAssets(text, srcName);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }

  if (items.length) {
    await pool.query('INSERT INTO asset_candidates (run_id, payload) VALUES ?', [items.map((i) => [run.insertId, JSON.stringify(i)])]);
  }
  await pool.query('UPDATE ai_runs SET items_found = ? WHERE id = ?', [items.length, run.insertId]);
  return NextResponse.json({ ok: true, count: items.length });
}
