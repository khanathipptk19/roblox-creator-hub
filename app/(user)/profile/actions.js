'use server';

import { pool } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updateProfile(prevState, formData) {
  const s = await getSession();
  if (!s) return { error: 'กรุณาเข้าสู่ระบบใหม่' };

  const name = formData.get('name')?.trim();
  const robloxUsername = formData.get('roblox_username')?.trim() || null;
  const discordTag = formData.get('discord_tag')?.trim() || null;
  const bio = formData.get('bio')?.trim() || null;

  if (!name) {
    return { error: 'กรุณาระบุชื่อที่แสดง' };
  }

  try {
    await pool.query(
      'UPDATE users SET name = ?, roblox_username = ?, discord_tag = ?, bio = ? WHERE id = ?',
      [name, robloxUsername, discordTag, bio, s.id]
    );
    revalidatePath('/profile'); // เปลี่ยน path ให้ตรงกับหน้าของคุณ
    return { success: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว' };
  } catch (err) {
    return { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' };
  }
}

export async function changePassword(prevState, formData) {
  const s = await getSession();
  if (!s) return { error: 'กรุณาเข้าสู่ระบบใหม่' };

  const currentPassword = formData.get('current_password');
  const newPassword = formData.get('new_password');
  const confirmPassword = formData.get('confirm_password');

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'กรุณากรอกข้อมูลรหัสผ่านให้ครบทุกช่อง' };
  }

  if (newPassword.length < 6) {
    return { error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน' };
  }

 try {
    // 1. เปลี่ยน SELECT password เป็น SELECT password_hash
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [s.id]);
    const user = rows[0];

    // 2. เปลี่ยน user.password เป็น user.password_hash
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return { error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // 3. เปลี่ยน SET password เป็น SET password_hash
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, s.id]);

    return { success: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว' };
  } catch (err) {
    console.error('Change password error:', err);
    return { error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' };
  }
}
