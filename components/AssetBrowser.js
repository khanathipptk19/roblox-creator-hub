'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, PLATFORMS, STYLES, safeUrl } from '@/lib/utils';

const STATUS = {
  safe: { cls: 'ok', text: 'ผ่านการสแกน · 0 Malicious Scripts' },
  pending: { cls: 'wait', text: 'รอการสแกน' },
  flagged: { cls: 'bad', text: 'พบความเสี่ยง ห้ามใช้' },
};
const VAL = { clean: ['ไม่พบ', 'ok'], found: ['พบ', 'bad'], warn: ['ควรตรวจเอง', 'wait'], na: ['ยังไม่ตรวจ', 'wait'] };
const imgOk = (u) => /^(https?:\/\/|\/(?!\/))/.test(u || '');

function Row({ label, value }) {
  const [t, c] = VAL[value] || VAL.na;
  return <li><span>{label}</span><b className={c}>{t}</b></li>;
}

function Card({ a }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const st = STATUS[a.scan_status] || STATUS.pending;
  const r = a.scan_report || {};
  const blocked = a.scan_status === 'flagged';
  async function copyId() {
    try { await navigator.clipboard.writeText(a.toolbox_id); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  }
  return (
    <article className="asset">
      <div className={`preview ph-${a.category}`}>
        {imgOk(a.preview_url) ? <img src={a.preview_url} alt="" loading="lazy" /> : <span className="phLabel">{CATEGORIES[a.category]}</span>}
        <span className={`badge onImg ${st.cls}`}>{st.text}</span>
        <span className="tris">{a.tris != null ? `${a.tris.toLocaleString()} Tris` : 'GUI'} · {STYLES[a.style] || STYLES.other}</span>
      </div>
      <div className="assetBody">
        <span className="tag">{CATEGORIES[a.category]}</span>
        <h3>{a.name}</h3>
        <p>{a.description}</p>
        {a.streaming_enabled ? <p className="src">รองรับ StreamingEnabled</p> : null}
        {a.source_name && (
          <p className="src">
            แหล่งที่มา:{' '}
            <a href={safeUrl(a.source_post_url || a.source_url)} target="_blank" rel="noopener noreferrer nofollow">{a.source_name}</a>
            {a.creator_credit && <> · เครดิต {a.creator_credit}</>}
            {a.creator_verified ? <span className="ver"> ✓ ผู้สร้างยืนยันแล้ว</span> : null}
          </p>
        )}
        <dl className="meta">
          <div><dt>Mesh</dt><dd>{a.mesh_optimized || 'ไม่ระบุ'}</dd></div>
        </dl>

        <button className="linkBtn" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'ซ่อนรายงานสแกน' : 'ดูรายงานสแกน'}</button>
        {open && (
          <div className="report">
            <ul>
              <li><span>Malicious Scripts</span><b className={Number(r.malicious_scripts) === 0 ? 'ok' : r.malicious_scripts == null ? 'wait' : 'bad'}>{r.malicious_scripts ?? 'ไม่ระบุ'}</b></li>
              <Row label="Backdoor" value={r.backdoor} />
              <Row label="require(AssetId)" value={r.require_assetid} />
              <Row label="โค้ด Obfuscated" value={r.obfuscated} />
              {r.remote_spam !== undefined && <Row label="RemoteEvent Spammer" value={r.remote_spam} />}
              {r.lag_bombs !== undefined && <Row label="Hidden Fire / Lag Bomb" value={r.lag_bombs} />}
            </ul>
            {r.auto && <p className="muted">สแกนอัตโนมัติด้วยกฎตรวจจับ ({String(r.auto.at || '').slice(0, 10)}): สคริปต์ {r.auto.scripts} ตัว แอดมินเป็นผู้ยืนยันผลขั้นสุดท้าย</p>}
            {r.note && <p className="muted">{r.note}</p>}
          </div>
        )}

        <div className="actions">
          {a.toolbox_id && !blocked && (
            <>
              <a className="btn small" href={`https://create.roblox.com/store/asset/${encodeURIComponent(a.toolbox_id)}`} target="_blank" rel="noreferrer">เปิดใน Roblox Studio</a>
              <button className="btn ghost small" onClick={copyId}>{copied ? 'คัดลอกแล้ว' : `คัดลอก ID ${a.toolbox_id}`}</button>
            </>
          )}
          {a.file_url && a.scan_status === 'safe' && <a className="btn ghost small" href={a.file_url} download>ดาวน์โหลด .rbxm</a>}
        </div>
      </div>
    </article>
  );
}

export default function AssetBrowser({ assets, sources = [] }) {
  const sliderMax = useMemo(() => Math.max(500, Math.ceil(Math.max(0, ...assets.map((a) => a.tris || 0)) / 500) * 500), [assets]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [styles, setStyles] = useState([]);
  const [maxTris, setMaxTris] = useState(sliderMax);
  const [safe, setSafe] = useState({ obf: false, remote: false, lag: false });
  const [streaming, setStreaming] = useState(false);
  const [sort, setSort] = useState('new');
  const search = useRef(null);

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search.current?.focus(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const toggleStyle = (k) => setStyles((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const reset = () => { setQ(''); setCat('all'); setStyles([]); setMaxTris(sliderMax); setSafe({ obf: false, remote: false, lag: false }); setStreaming(false); };

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const out = assets.filter((a) => {
      if (cat !== 'all' && a.category !== cat) return false;
      if (t && ![a.name, a.description, a.toolbox_id, a.tags, a.creator_credit, a.source_name].join(' ').toLowerCase().includes(t)) return false;
      if (styles.length && !styles.includes(a.style)) return false;
      if (a.tris != null && a.tris > maxTris) return false;
      if (streaming && !a.streaming_enabled) return false;
      const r = a.scan_report || {};
      if (safe.obf && r.obfuscated !== 'clean') return false;
      if (safe.remote && r.remote_spam !== 'clean') return false;
      if (safe.lag && r.lag_bombs !== 'clean') return false;
      return true;
    });
    const by = {
      new: (a, b) => b.id - a.id,
      tris_asc: (a, b) => (a.tris ?? Infinity) - (b.tris ?? Infinity),
      tris_desc: (a, b) => (b.tris ?? -1) - (a.tris ?? -1),
      name: (a, b) => a.name.localeCompare(b.name, 'th'),
    };
    return [...out].sort(by[sort]);
  }, [assets, q, cat, styles, maxTris, safe, streaming, sort]);

  const count = (c) => (c === 'all' ? assets.length : assets.filter((a) => a.category === c).length);

  return (
    <>
      {sources.length > 0 && (
        <section className="sources" aria-label="แหล่งแจกโมเดล">
          <h2>แหล่งแจกโมเดลที่เรารวบรวม</h2>
          <ul>
            {sources.map((s) => (
              <li key={s.id}>
                <a href={safeUrl(s.url)} target="_blank" rel="noopener noreferrer nofollow">{s.name}</a>
                <span className="tag">{PLATFORMS[s.platform] || s.platform}</span>
                {s.description && <small>{s.description}</small>}
              </li>
            ))}
          </ul>
          <p className="muted">เป็นเพียงลิงก์ไปยังต้นทาง โมเดลเป็นของผู้สร้างแต่ละคน โปรดอ่านเงื่อนไขการใช้งานของกลุ่มก่อนนำไปใช้</p>
        </section>
      )}

      <div className="searchRow">
        <input ref={search} type="search" className="searchBox wide" placeholder="ค้นหาชื่อโมเดล, Toolbox ID, แท็ก เช่น cyberpunk, low-poly, vehicle (Ctrl+K)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="ค้นหาโมเดล" />
      </div>

      <div className="tabs" role="tablist" aria-label="หมวดโมเดล">
        {[['all', 'หมวดหมู่ทั้งหมด'], ...Object.entries(CATEGORIES)].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={cat === k} className={cat === k ? 'on' : ''} onClick={() => setCat(k)}>{label} ({count(k)})</button>
        ))}
      </div>

      <div className="hubLayout">
        <aside className="filters" aria-label="ตัวกรองละเอียด">
          <div className="filterHead"><h3>ตัวกรองละเอียด</h3><button className="linkBtn" onClick={reset}>รีเซ็ต</button></div>

          <fieldset>
            <legend>สไตล์กราฟิก</legend>
            {['low_poly', 'anime', 'realistic'].map((k) => (
              <label key={k} className="chk"><input type="checkbox" checked={styles.includes(k)} onChange={() => toggleStyle(k)} /> {STYLES[k]} <small>({assets.filter((a) => a.style === k).length})</small></label>
            ))}
          </fieldset>

          <fieldset>
            <legend>จำกัด Tris สูงสุด: {maxTris.toLocaleString()}</legend>
            <input type="range" min={0} max={sliderMax} step={100} value={maxTris} onChange={(e) => setMaxTris(Number(e.target.value))} aria-label="จำกัดจำนวน Tris" />
            <div className="rangeLabels"><small>0</small><small>{sliderMax.toLocaleString()}</small></div>
          </fieldset>

          <fieldset>
            <legend>เกณฑ์ความปลอดภัย</legend>
            <label className="chk"><input type="checkbox" checked={safe.obf} onChange={(e) => setSafe({ ...safe, obf: e.target.checked })} /> ไม่มีโค้ด Obfuscated</label>
            <label className="chk"><input type="checkbox" checked={safe.remote} onChange={(e) => setSafe({ ...safe, remote: e.target.checked })} /> ไม่มี RemoteEvent Spammer</label>
            <label className="chk"><input type="checkbox" checked={safe.lag} onChange={(e) => setSafe({ ...safe, lag: e.target.checked })} /> ไม่มี Hidden Fire / Lag Bomb</label>
          </fieldset>

          <label className="chk"><input type="checkbox" checked={streaming} onChange={(e) => setStreaming(e.target.checked)} /> รองรับ StreamingEnabled</label>
        </aside>

        <div>
          <div className="hubHead">
            <h2>รายการโมเดล <span className="tag">{list.length} รายการ</span></h2>
            <label className="sortBox">เรียงตาม
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="new">ล่าสุด</option>
                <option value="tris_asc">Tris น้อยไปมาก</option>
                <option value="tris_desc">Tris มากไปน้อย</option>
                <option value="name">ชื่อ ก-ฮ</option>
              </select>
            </label>
          </div>
          {list.length === 0 ? <p className="muted">ไม่พบโมเดลที่ตรงกับตัวกรอง ลองกดรีเซ็ต</p> : <div className="grid">{list.map((a) => <Card key={a.id} a={a} />)}</div>}
        </div>
      </div>
    </>
  );
}
