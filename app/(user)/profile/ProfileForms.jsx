'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateProfile, changePassword } from './actions';

// สร้างปุ่มแยกเพื่อเช็กสถานะกำลังโหลดใน Next.js 14
function SubmitButton({ label, pendingLabel }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function ProfileForms({ user }) {
  const [profileState, profileAction] = useFormState(updateProfile, null);
  const [passState, passAction] = useFormState(changePassword, null);

  return (
    <div className="profileForms">
      {/* ฟอร์มแก้ไขข้อมูลผู้ใช้ */}
      <section className="formSection">
        <h2>แก้ไขข้อมูลส่วนตัว</h2>
        <form action={profileAction}>
          <div className="formGroup">
            <label htmlFor="name">ชื่อที่แสดง *</label>
            <input id="name" name="name" type="text" defaultValue={user.name} required />
          </div>

          <div className="formGroup">
            <label htmlFor="roblox_username">ชื่อผู้ใช้ Roblox (Username)</label>
            <input
              id="roblox_username"
              name="roblox_username"
              type="text"
              placeholder="เช่น Builderman"
              defaultValue={user.roblox_username || ''}
            />
          </div>

          <div className="formGroup">
            <label htmlFor="discord_tag">Discord</label>
            <input
              id="discord_tag"
              name="discord_tag"
              type="text"
              placeholder="เช่น username"
              defaultValue={user.discord_tag || ''}
            />
          </div>

          <div className="formGroup">
            <label htmlFor="bio">แนะนำตัวสั้นๆ (Bio)</label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              placeholder="เช่น นักพัฒนาเกมแนว Simulator / Scripter"
              defaultValue={user.bio || ''}
            />
          </div>

          {profileState?.error && <p className="msgError">{profileState.error}</p>}
          {profileState?.success && <p className="msgSuccess">{profileState.success}</p>}

          <SubmitButton label="บันทึกข้อมูล" pendingLabel="กำลังบันทึก..." />
        </form>
      </section>

      <hr />

      {/* ฟอร์มเปลี่ยนรหัสผ่าน */}
      <section className="formSection">
        <h2>เปลี่ยนรหัสผ่าน</h2>
        <form action={passAction}>
          <div className="formGroup">
            <label htmlFor="current_password">รหัสผ่านปัจจุบัน *</label>
            <input id="current_password" name="current_password" type="password" required />
          </div>

          <div className="formGroup">
            <label htmlFor="new_password">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร) *</label>
            <input id="new_password" name="new_password" type="password" minLength={6} required />
          </div>

          <div className="formGroup">
            <label htmlFor="confirm_password">ยืนยันรหัสผ่านใหม่ *</label>
            <input id="confirm_password" name="confirm_password" type="password" minLength={6} required />
          </div>

          {passState?.error && <p className="msgError">{passState.error}</p>}
          {passState?.success && <p className="msgSuccess">{passState.success}</p>}

          <SubmitButton label="อัปเดตรหัสผ่าน" pendingLabel="กำลังเปลี่ยนรหัสผ่าน..." />
        </form>
      </section>
    </div>
  );
}