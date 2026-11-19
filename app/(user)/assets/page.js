import { pool } from '@/lib/db';
import { parseJson } from '@/lib/utils';
import AssetBrowser from '@/components/AssetBrowser';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'โมเดลฟรีผ่านการตรวจ' };

export default async function AssetsPage() {
  const [rows] = await pool.query(
    `SELECT a.*, s.name AS source_name, s.platform AS source_platform, s.url AS source_url
     FROM assets a LEFT JOIN asset_sources s ON s.id = a.source_id
     ORDER BY a.id DESC`
  );
  const [sources] = await pool.query('SELECT * FROM asset_sources ORDER BY id');
  const assets = rows.map((a) => ({ ...a, scan_report: parseJson(a.scan_report, {}) }));
  const safe = assets.filter((a) => a.scan_status === 'safe').length;
  const flagged = assets.filter((a) => a.scan_status === 'flagged').length;

  return (
    <>
      <p className="eyebrow">Asset Hub</p>
      <h1>คลังโมเดล 3D ฟรี คัดกรองสคริปต์อันตราย</h1>
      <p className="lead">ทุกชิ้นมีรายงานสแกนให้ดูก่อนนำเข้า Studio โมเดลที่ติดธงแดงจะไม่แสดงปุ่มดาวน์โหลด</p>
      <ul className="statChips">
        <li><b>{assets.length}</b><span>โมเดลในคลัง</span></li>
        <li><b>{safe}</b><span>ผ่านการตรวจ</span></li>
        <li><b>{flagged}</b><span>ติดธงแดง</span></li>
        <li><b>{sources.length}</b><span>แหล่งแจกที่อ้างอิง</span></li>
      </ul>
      <AssetBrowser assets={assets} sources={JSON.parse(JSON.stringify(sources))} />
    </>
  );
}
