# Roblox Creator Hub (Next.js + MySQL + สิทธิ์ user/admin)

1. phpMyAdmin > Import > database/schema.sql  (สร้างฐานข้อมูล roblox_rbac_db + ตาราง + ข้อมูลตัวอย่าง)
2. (แนะนำ) phpMyAdmin > SQL > รัน database/create_db_user.sql  (สร้าง user สำหรับแอป)
3. cp .env.example .env.local แล้วแก้ DB_USER / DB_PASSWORD / AUTH_SECRET
4. npm install
5. npm run dev  แล้วสมัครสมาชิกที่ /register
6. เลื่อนเป็นแอดมิน: รัน database/promote_admin.sql (หรือ npm run create-admin -- email ชื่อ รหัสผ่าน)
