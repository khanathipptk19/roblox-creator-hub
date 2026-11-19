// อ่านเนื้อไฟล์ .rbxm เพื่อดึงโค้ดของ Script / LocalScript / ModuleScript และนับชนิดวัตถุ
// ไม่รันโค้ดใด ๆ และมีเพดานขนาดข้อมูลหลังคลายบีบอัด กันไฟล์ระเบิด (zip bomb)
const BIN_MAGIC = Buffer.from([0x3c, 0x72, 0x6f, 0x62, 0x6c, 0x6f, 0x78, 0x21, 0x89, 0xff, 0x0d, 0x0a, 0x1a, 0x0a]);
const SCRIPT_CLASSES = new Set(['Script', 'LocalScript', 'ModuleScript']);
const MAX_CHUNK = 64 * 1024 * 1024;
const MAX_TOTAL = 160 * 1024 * 1024;
const MAX_CHUNKS = 50000;
const MAX_STR = 8 * 1024 * 1024;
const MAX_SCRIPTS = 2000;

export function lz4Block(src, outLen) {
  const out = Buffer.allocUnsafe(outLen);
  let s = 0, d = 0;
  const byte = () => { if (s >= src.length) throw new Error('lz4 truncated'); return src[s++]; };
  while (s < src.length) {
    const token = byte();
    let lit = token >> 4;
    if (lit === 15) { let b; do { b = byte(); lit += b; } while (b === 255); }
    if (s + lit > src.length || d + lit > outLen) throw new Error('lz4 literal overflow');
    src.copy(out, d, s, s + lit); s += lit; d += lit;
    if (s >= src.length) break;
    const offset = byte() | (byte() << 8);
    if (offset === 0 || offset > d) throw new Error('lz4 bad offset');
    let ml = token & 15;
    if (ml === 15) { let b; do { b = byte(); ml += b; } while (b === 255); }
    ml += 4;
    if (d + ml > outLen) throw new Error('lz4 match overflow');
    for (let i = 0; i < ml; i++) { out[d] = out[d - offset]; d++; }
  }
  if (d !== outLen) throw new Error('lz4 size mismatch');
  return out;
}

function parseBinary(buf) {
  const res = { format: 'binary', complete: false, warnings: [], classCounts: {}, scripts: [], instances: 0 };
  let off = 14;
  off += 2;                                  // version
  off += 4;                                  // class count
  res.instances = buf.readInt32LE(off); off += 4;
  off += 8;                                  // reserved
  const classes = new Map();                 // classId -> { name, count, names, sources }
  let total = 0, chunks = 0, ended = false, skipped = false;

  const readInst = (data) => {
    const id = data.readUInt32LE(0);
    let o = 4;
    const nl = data.readUInt32LE(o); o += 4;
    if (nl > 256 || o + nl > data.length) throw new Error('bad class name');
    const name = data.toString('utf8', o, o + nl); o += nl;
    o += 1;                                  // object format
    const count = data.readUInt32LE(o);
    if (count > 5_000_000) throw new Error('bad count');
    classes.set(id, { name, count });
    res.classCounts[name] = (res.classCounts[name] || 0) + count;
  };

  const readProp = (data) => {
    const id = data.readUInt32LE(0);
    let o = 4;
    const nl = data.readUInt32LE(o); o += 4;
    if (nl > 256 || o + nl > data.length) throw new Error('bad prop name');
    const prop = data.toString('utf8', o, o + nl); o += nl;
    const type = data[o++];
    if (type !== 1 || (prop !== 'Source' && prop !== 'Name')) return;
    const cls = classes.get(id);
    if (!cls || !SCRIPT_CLASSES.has(cls.name)) return;
    const arr = [];
    for (let i = 0; i < cls.count; i++) {
      const len = data.readUInt32LE(o); o += 4;
      if (len > MAX_STR || o + len > data.length) throw new Error('bad string');
      arr.push(data.toString('utf8', o, o + len)); o += len;
    }
    if (prop === 'Source') cls.sources = arr; else cls.names = arr;
  };

  while (off + 16 <= buf.length && chunks++ < MAX_CHUNKS) {
    const tag = buf.toString('latin1', off, off + 4);
    const clen = buf.readUInt32LE(off + 4);
    const ulen = buf.readUInt32LE(off + 8);
    off += 16;
    const size = clen === 0 ? ulen : clen;
    if (off + size > buf.length) { res.warnings.push('ไฟล์ถูกตัดไม่ครบ'); break; }
    const raw = buf.subarray(off, off + size); off += size;
    if (tag === 'END\0') { ended = true; break; }
    if (tag !== 'INST' && tag !== 'PROP') continue;
    if (ulen > MAX_CHUNK) { res.warnings.push('พบข้อมูลก้อนใหญ่ผิดปกติ จึงข้ามไป'); skipped = true; continue; }
    total += ulen;
    if (total > MAX_TOTAL) { res.warnings.push('ข้อมูลหลังคลายบีบอัดใหญ่เกินกำหนด จึงหยุดสแกน'); skipped = true; break; }
    try {
      const data = clen === 0 ? raw : lz4Block(raw, ulen);
      if (tag === 'INST') readInst(data); else readProp(data);
    } catch {
      res.warnings.push(`อ่านข้อมูลส่วน ${tag} ไม่สำเร็จ`); skipped = true;
    }
  }

  let unreadable = false;
  for (const cls of classes.values()) {
    if (!SCRIPT_CLASSES.has(cls.name) || cls.count === 0) continue;
    if (!cls.sources) { unreadable = true; continue; }
    for (let i = 0; i < cls.count && res.scripts.length < MAX_SCRIPTS; i++) {
      res.scripts.push({ cls: cls.name, name: cls.names?.[i] || cls.name, source: cls.sources[i] ?? '' });
    }
  }
  if (unreadable) res.warnings.push('ไม่พบข้อมูลโค้ดของสคริปต์บางตัว');
  if (res.scripts.length >= MAX_SCRIPTS) res.warnings.push('สคริปต์มากเกินกำหนด ตรวจไม่ครบ');
  if (!ended) res.warnings.push('ไม่พบจุดสิ้นสุดไฟล์');
  res.complete = ended && !skipped && !unreadable && res.warnings.length === 0;
  return res;
}

function parseXml(text) {
  const res = { format: 'xml', complete: false, warnings: [], classCounts: {}, scripts: [], instances: 0 };
  const parts = text.split('<Item class="');
  for (const part of parts.slice(1)) {
    const cls = part.slice(0, part.indexOf('"'));
    res.classCounts[cls] = (res.classCounts[cls] || 0) + 1;
    res.instances += 1;
    if (!SCRIPT_CLASSES.has(cls) || res.scripts.length >= MAX_SCRIPTS) continue;
    const name = /<string name="Name">([^<]*)<\/string>/.exec(part)?.[1] || cls;
    let src = /<ProtectedString name="Source"><!\[CDATA\[([\s\S]*?)\]\]><\/ProtectedString>/.exec(part)?.[1];
    if (src === undefined) {
      const plain = /<ProtectedString name="Source">([\s\S]*?)<\/ProtectedString>/.exec(part)?.[1];
      src = plain === undefined ? '' : plain.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    }
    res.scripts.push({ cls, name, source: src });
  }
  if (res.scripts.length >= MAX_SCRIPTS) res.warnings.push('สคริปต์มากเกินกำหนด ตรวจไม่ครบ');
  res.complete = /<\/roblox>\s*$/.test(text) && res.warnings.length === 0;
  if (!res.complete && !res.warnings.length) res.warnings.push('ไฟล์ XML ไม่ครบหรือถูกตัด');
  return res;
}

export function parseRbxm(buf) {
  try {
    if (buf.length >= 32 && buf.subarray(0, 14).equals(BIN_MAGIC)) return parseBinary(buf);
    if (buf.subarray(0, 64).toString('utf8').trimStart().startsWith('<roblox')) return parseXml(buf.toString('utf8'));
  } catch {
    return { format: 'binary', complete: false, warnings: ['อ่านโครงสร้างไฟล์ไม่สำเร็จ'], classCounts: {}, scripts: [], instances: 0 };
  }
  return { format: 'unknown', complete: false, warnings: ['ไม่ใช่ไฟล์ .rbxm ที่รู้จัก'], classCounts: {}, scripts: [], instances: 0 };
}
