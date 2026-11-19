import { pool } from '@/lib/db';
import { parseJson } from '@/lib/utils';
import ScriptVault from '@/components/ScriptVault';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'คลังสคริปต์ Lua พื้นฐาน' };

export default async function ScriptsPage() {
  const [rows] = await pool.query('SELECT * FROM scripts ORDER BY is_featured DESC, sort_order, id');
  const scripts = rows.map((r) => ({
    ...r,
    explanations: parseJson(r.explanations, {}),
    mistakes: parseJson(r.mistakes, []),
    key_concepts: parseJson(r.key_concepts, []),
  }));
  return (
    <>
      <p className="eyebrow">Script Vault</p>
      <h1>คลังสคริปต์ Lua พื้นฐานสำหรับมือใหม่</h1>
      <p className="lead">คัดลอกไปใช้ได้ทันที พร้อมคำอธิบายทีละบรรทัด จุดวางสคริปต์ที่ถูกต้อง และข้อผิดพลาดที่พบบ่อย</p>
      <ScriptVault scripts={scripts} />
    </>
  );
}
