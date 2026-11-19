'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useCrud(table) {
  const router = useRouter();
  const [msg, setMsg] = useState({ type: '', text: '' });

  async function save(id, data) {
    const res = await fetch(`/api/admin/${table}`, {
      method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg({ type: 'err', text: j.error || 'บันทึกไม่สำเร็จ' }); return false; }
    setMsg({ type: 'ok', text: 'บันทึกแล้ว' });
    router.refresh();
    return true;
  }
  async function remove(id, label) {
    if (!confirm(`ลบ "${label}" ใช่หรือไม่?`)) return false;
    const res = await fetch(`/api/admin/${table}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (!res.ok) { setMsg({ type: 'err', text: 'ลบไม่สำเร็จ' }); return false; }
    setMsg({ type: 'ok', text: 'ลบแล้ว' });
    router.refresh();
    return true;
  }
  return { save, remove, msg, setMsg };
}
