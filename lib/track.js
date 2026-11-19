// บันทึกว่าผู้ใช้เคยใช้งานของชิ้นนี้ (คัดลอกสคริปต์ / ดาวน์โหลดโมเดล) ใช้จัดอันดับหน้าแรก
// ล้มเหลวเงียบ ๆ ได้ ไม่กระทบการใช้งานหลัก
export function trackUse(type, id) {
  try {
    fetch('/api/track', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id }), keepalive: true,
    }).catch(() => {});
  } catch {}
}
