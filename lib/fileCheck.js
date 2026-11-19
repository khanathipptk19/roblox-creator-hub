export const MODEL_MAX = 25 * 1024 * 1024;
export const PREVIEW_MAX = 3 * 1024 * 1024;

export function imageExt(b) {
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return null;
}

// .rbxm แบบไบนารีขึ้นต้นด้วย "<roblox!" ส่วนแบบ XML ขึ้นต้นด้วย "<roblox"
export function isRbxm(buf, filename) {
  const bin = buf.subarray(0, 8).toString('latin1') === '<roblox!';
  const xml = buf.subarray(0, 64).toString('utf8').trimStart().startsWith('<roblox');
  return /\.rbxm$/i.test(String(filename)) && (bin || xml);
}
