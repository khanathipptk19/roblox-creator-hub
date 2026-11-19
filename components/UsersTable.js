'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersTable({ rows, meId }) {
  const router = useRouter();
  const [msg, setMsg] = useState('');

  async function call(method, body) {
    const res = await fetch('/api/admin/users', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await res.json();
    if (!res.ok) setMsg(j.error || 'ผิดพลาด'); else { setMsg(''); router.refresh(); }
  }
  const setRole = (u, role) => call('PUT', { id: u.id, role });
  const remove = (u) => { if (confirm(`ลบบัญชี ${u.email} ใช่หรือไม่?`)) call('DELETE', { id: u.id }); };

  return (
    <>
      {msg && <p className="err" role="alert">{msg}</p>}
      <div className="tableWrap">
        <table className="dataTable">
          <thead><tr><th>ชื่อ</th><th>อีเมล</th><th>บทบาท</th><th>สมัครเมื่อ</th><th /></tr></thead>
          <tbody>
            {rows.map((u) => {
              const me = u.id === meId;
              return (
                <tr key={u.id}>
                  <td>{u.name}{me && <span className="tag">คุณ</span>}</td>
                  <td>{u.email}</td>
                  <td>
                    <select value={u.role} disabled={me} onChange={(e) => setRole(u, e.target.value)} aria-label={`บทบาทของ ${u.email}`}>
                      <option value="user">ผู้ใช้</option>
                      <option value="admin">แอดมิน</option>
                    </select>
                  </td>
                  <td>{u.created_at.slice(0, 10)}</td>
                  <td><button className="btn danger small" disabled={me} onClick={() => remove(u)}>ลบ</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
