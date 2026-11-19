import Link from 'next/link';
import { pool } from '@/lib/db';
import { TABLES } from '@/lib/tables';
import ContentEditor from '@/components/ContentEditor';
import AssetEditor from '@/components/AssetEditor';
import ScriptEditor from '@/components/ScriptEditor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'จัดการเนื้อหา' };

export default async function ContentPage({ searchParams }) {
  const t = TABLES[searchParams?.t] ? searchParams.t : 'scripts';
  const [rows] = await pool.query(`SELECT * FROM ?? ORDER BY ${TABLES[t].orderBy}`, [t]);
  const refs = {};
  for (const f of TABLES[t].fields) {
    if (f.type === 'ref') {
      const [r] = await pool.query('SELECT id, ?? FROM ?? ORDER BY id', [f.refLabel, f.ref]);
      refs[f.ref] = JSON.parse(JSON.stringify(r));
    }
  }
  const safeRows = JSON.parse(JSON.stringify(rows));
  return (
    <>
      <h1>จัดการเนื้อหา</h1>
      <div className="tabs">
        {Object.entries(TABLES).map(([k, c]) => (
          <Link key={k} href={`/admin/content?t=${k}`} className={k === t ? 'on' : ''}>{c.label}</Link>
        ))}
      </div>
      {t === 'assets' ? <AssetEditor key={t} rows={safeRows} refs={refs} />
        : t === 'scripts' ? <ScriptEditor key={t} rows={safeRows} />
        : <ContentEditor key={t} table={t} rows={safeRows} refs={refs} />}
    </>
  );
}
