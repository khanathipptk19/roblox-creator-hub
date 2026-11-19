import { parseRbxm } from './rbxm.js';
import { scanSource } from './scanner.js';

export const CHECK_KEYS = ['backdoor', 'require_assetid', 'obfuscated', 'remote_spam', 'lag_bombs'];
const FX = ['ParticleEmitter', 'Fire', 'Smoke', 'Sparkles', 'Explosion', 'Beam', 'Trail'];

// ผลลัพธ์แต่ละข้อ: found = พบความเสี่ยงสูง, warn = ควรตรวจเอง, clean = ไม่พบตามกฎ, na = อ่านไฟล์ได้ไม่ครบ จึงยืนยันไม่ได้
export function scanBuffer(buf) {
  const p = parseRbxm(buf);
  const findings = [];
  const bad = new Set();
  p.scripts.forEach((s, i) => {
    for (const f of scanSource(s.source)) {
      findings.push({ script: s.name, cls: s.cls, ...f });
      if (f.level === 'high') bad.add(i);
    }
  });
  const fx = FX.reduce((n, c) => n + (p.classCounts[c] || 0), 0);
  if (fx > 150) findings.push({ script: '(โมเดล)', cls: '-', rule: 'fx_count', category: 'lag_bombs', level: 'medium', line: 0, message: `พบเอฟเฟกต์ ${fx} ชิ้น (Fire/Smoke/ParticleEmitter ฯลฯ) อาจทำให้เครื่องหน่วง` });

  const checks = {};
  for (const k of CHECK_KEYS) {
    const hi = findings.some((f) => f.category === k && f.level === 'high');
    const me = findings.some((f) => f.category === k && f.level === 'medium');
    checks[k] = hi ? 'found' : !p.complete ? 'na' : me ? 'warn' : 'clean';
  }
  const instances = p.instances || Object.values(p.classCounts).reduce((a, b) => a + b, 0);
  return {
    checks,
    malicious_scripts: bad.size > 0 ? bad.size : p.complete ? 0 : undefined,
    findings: findings.slice(0, 40),
    auto: { at: new Date().toISOString(), scripts: p.scripts.length, instances, complete: p.complete, format: p.format, warnings: p.warnings.slice(0, 5) },
  };
}
