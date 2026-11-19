-- สมัครสมาชิกผ่านหน้าเว็บก่อน แล้วรันคำสั่งนี้เพื่อเลื่อนเป็นแอดมิน
UPDATE roblox_rbac_db.users SET role = 'admin' WHERE email = 'อีเมลที่สมัครไว้';
