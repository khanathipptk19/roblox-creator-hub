export const parseJson = (v, fallback) => {
  if (v == null) return fallback;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return fallback; }
};

export const CATEGORIES = {
  buildings: 'ตึก/อาคาร',
  vehicles: 'ยานพาหนะ',
  props: 'อาวุธ/พร็อพ',
  nature: 'ธรรมชาติ/ต้นไม้',
  gui: 'ระบบ GUI',
};

export const PLATFORMS = {
  facebook_group: 'กลุ่ม Facebook',
  facebook_page: 'เพจ Facebook',
  discord: 'Discord',
  roblox_group: 'กลุ่ม Roblox',
  other: 'อื่น ๆ',
};

// อนุญาตเฉพาะลิงก์ http(s) กัน javascript: ที่อาจถูกกรอกมา
export const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '#');

export const STYLES = { low_poly: 'Low-Poly', anime: 'Anime / Stylized', realistic: 'Realistic PBR', other: 'อื่น ๆ' };
export const DIFFICULTY = { beginner: 'เริ่มต้น', intermediate: 'ปานกลาง' };
