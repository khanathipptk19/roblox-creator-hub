// ตรวจโค้ด Luau ด้วยกฎ (static analysis) ไม่รันโค้ด ผลเป็น "ข้อสังเกต" ไม่ใช่การรับรองความปลอดภัย
// level: high = เข้าข่ายอันตรายสูง, medium = ควรเปิดอ่านเอง
const MAX_SRC = 300000;
const MAX_LINE = 20000;

const stripComments = (s) =>
  s.replace(/--\[(=*)\[[\s\S]*?\]\1\]/g, (m) => '\n'.repeat((m.match(/\n/g) || []).length))
   .replace(/--[^\n]*/g, '');

const YIELD = /\b(?:task\.wait|task\.defer|task\.spawn|wait|Heartbeat|Stepped|RenderStepped|RunService)\b|:Wait\s*\(/;
const INF_LOOP = /\bwhile\s+(?:true|1)\s+do\b/;
const REMOTE_CALL = /[:.]\s*(?:FireServer|FireAllClients|FireClient|InvokeServer|InvokeClient)\s*\(/;
const LOOPY = /\bwhile\b|\brepeat\b|\bRenderStepped\b|\bHeartbeat\b|\bStepped\b/;
const BIG_LOOP = /\bfor\s+\w+\s*=\s*1\s*,\s*\d{5,}/;
const SPAWN = /\b(?:Instance\.new|:Clone)\s*\(/;

const LINE_RULES = [
  { id: 'loadstring', category: 'backdoor', level: 'high', re: /\bloadstring\s*\(/, message: 'พบ loadstring รันโค้ดที่สร้างตอนรันไทม์ (วิธีที่ Backdoor ใช้บ่อย)' },
  { id: 'require_id', category: 'require_assetid', level: 'high', re: /\brequire\s*\(\s*(?:\d{4,}|tonumber\s*\()/, message: 'พบ require(AssetId) โหลดโค้ดจากภายนอกที่ควบคุมไม่ได้' },
  { id: 'fenv', category: 'backdoor', level: 'medium', re: /\b(?:getfenv|setfenv)\s*\(/, message: 'พบ getfenv/setfenv มักใช้ซ่อนพฤติกรรม' },
  { id: 'loadasset', category: 'backdoor', level: 'medium', re: /InsertService\s*[:.]\s*LoadAsset/, message: 'โหลดโมเดลจากภายนอกด้วย InsertService' },
  { id: 'http', category: 'backdoor', level: 'medium', re: /HttpService\s*[:.]\s*(?:GetAsync|PostAsync|RequestAsync)/, message: 'มีการเรียก HTTP ออกภายนอก ควรตรวจปลายทาง' },
  { id: 'backdoor_kw', category: 'backdoor', level: 'medium', re: /\b(?:backdoor|infect|virus)\b/i, message: 'พบคำที่เกี่ยวข้องกับ Backdoor ในโค้ด' },
  { id: 'obf_escape', category: 'obfuscated', level: 'high', re: /(?:\\\d{1,3}){12,}/, message: 'พบสตริง escape เลขจำนวนมาก (ลักษณะโค้ด Obfuscated)' },
  { id: 'obf_blob', category: 'obfuscated', level: 'medium', re: /[A-Za-z0-9+/=]{160,}/, message: 'พบสตริงยาวผิดปกติ อาจเป็น Base64 หรือข้อมูลซ่อน' },
  { id: 'obf_names', category: 'obfuscated', level: 'medium', re: /\b[Il1O0]{10,}\b/, message: 'พบชื่อตัวแปรหน้าตาคล้ายกันยาว ๆ (ลักษณะตัวบีบโค้ด)' },
];

const lineOf = (code, idx) => code.slice(0, idx).split('\n').length;

export function scanSource(source) {
  const findings = [];
  const perRule = {};
  const add = (f) => {
    perRule[f.rule] = (perRule[f.rule] || 0) + 1;
    if (perRule[f.rule] <= 5) findings.push(f);
  };

  let src = String(source || '');
  if (src.length > MAX_SRC) {
    add({ rule: 'too_long', category: 'obfuscated', level: 'medium', line: 0, message: `สคริปต์ยาวผิดปกติ (${src.length.toLocaleString()} ตัวอักษร) ตรวจเพียงบางส่วน` });
    src = src.slice(0, MAX_SRC);
  }
  const code = stripComments(src);
  const lines = code.split('\n');

  lines.forEach((raw, i) => {
    let ln = raw;
    if (ln.length > MAX_LINE) {
      add({ rule: 'long_line', category: 'obfuscated', level: 'medium', line: i + 1, message: 'พบบรรทัดยาวผิดปกติ (โค้ดอัดแน่นในบรรทัดเดียว)' });
      ln = ln.slice(0, MAX_LINE);
    }
    for (const r of LINE_RULES) if (r.re.test(ln)) add({ rule: r.id, category: r.category, level: r.level, line: i + 1, message: r.message });
    // string.char ที่ต่อตัวอักษรหลายตัว (นับจุลภาคแทน regex ซ้อน กัน backtrack)
    const m = /string\.char\s*\(/.exec(ln);
    if (m) {
      const seg = ln.slice(m.index, m.index + 400).split(')')[0];
      if ((seg.match(/,/g) || []).length >= 8) add({ rule: 'obf_char', category: 'obfuscated', level: 'medium', line: i + 1, message: 'ประกอบสตริงด้วย string.char จำนวนมาก' });
    }
  });

  const hasInf = INF_LOOP.exec(code);
  const noYield = !YIELD.test(code);
  if (hasInf && noYield) {
    add({ rule: 'loop_no_yield', category: 'lag_bombs', level: 'high', line: lineOf(code, hasInf.index), message: 'วนลูป while true do โดยไม่มี wait ทำให้เกมค้างหรือหน่วงหนัก' });
  }
  const big = BIG_LOOP.exec(code);
  if (big && SPAWN.test(code)) {
    add({ rule: 'mass_spawn', category: 'lag_bombs', level: 'high', line: lineOf(code, big.index), message: 'วนลูปจำนวนมากพร้อมสร้าง/โคลนวัตถุ อาจทำให้เกมค้าง' });
  }
  const call = REMOTE_CALL.exec(code);
  if (call) {
    if (hasInf && noYield) add({ rule: 'remote_spam', category: 'remote_spam', level: 'high', line: lineOf(code, call.index), message: 'ยิง RemoteEvent ในลูปที่ไม่มี wait (RemoteEvent Spammer)' });
    else if (LOOPY.test(code)) add({ rule: 'remote_loop', category: 'remote_spam', level: 'medium', line: lineOf(code, call.index), message: 'ยิง RemoteEvent ในสคริปต์ที่มีลูปหรือทำงานทุกเฟรม ควรตรวจว่าถี่เกินไปหรือไม่' });
  }
  return findings;
}
