import { pool } from '@/lib/db';
import { parseJson } from '@/lib/utils';
import QueueManager from '@/components/QueueManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'คิวรอตรวจ' };

export default async function QueuePage() {
  const [sources] = await pool.query('SELECT id, name FROM asset_sources ORDER BY id');
  const [pend] = await pool.query(
    `SELECT c.id, c.payload, c.created_at, r.raw_text, r.post_url, s.name AS source_name
     FROM asset_candidates c JOIN ai_runs r ON r.id = c.run_id LEFT JOIN asset_sources s ON s.id = r.source_id
     WHERE c.status = 'pending' ORDER BY c.id DESC`);
  const [hist] = await pool.query(
    `SELECT c.id, c.payload, c.status, c.reviewed_at, u.name AS reviewer
     FROM asset_candidates c LEFT JOIN users u ON u.id = c.reviewed_by
     WHERE c.status <> 'pending' ORDER BY c.reviewed_at DESC LIMIT 20`);
  const [[usage]] = await pool.query('SELECT COUNT(*) AS c FROM ai_runs WHERE created_at >= CURDATE()');

  const pending = pend.map((p) => ({ id: p.id, fields: parseJson(p.payload, {}), raw_text: p.raw_text, post_url: p.post_url, source_name: p.source_name }));
  const history = hist.map((h) => ({ id: h.id, name: parseJson(h.payload, {}).name, status: h.status, reviewer: h.reviewer, at: h.reviewed_at ? new Date(h.reviewed_at).toISOString().slice(0, 16).replace('T', ' ') : '' }));

  return (
    <>
      <h1>คิวรอตรวจ</h1>
      <p className="muted">คัดลอกข้อความโพสต์จากกลุ่ม/เพจมาวาง ให้ AI จัดเป็นรายการ แล้วแอดมินตรวจและกดอนุมัติ</p>
      <QueueManager
        sources={sources} pending={pending} history={history}
        used={usage.c} limit={Number(process.env.AI_DAILY_LIMIT || 30)} hasKey={!!process.env.ANTHROPIC_API_KEY}
      />
    </>
  );
}
