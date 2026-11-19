-- รันใน phpMyAdmin แท็บ SQL (หลัง import schema.sql แล้ว)
-- แก้ 'ตั้งรหัสผ่านเอง' ก่อนรัน แล้วใส่ DB_USER=roblox_app และรหัสผ่านใน .env.local
CREATE USER IF NOT EXISTS 'roblox_app'@'localhost' IDENTIFIED BY 'ตั้งรหัสผ่านเอง';
CREATE USER IF NOT EXISTS 'roblox_app'@'127.0.0.1' IDENTIFIED BY 'ตั้งรหัสผ่านเอง';
GRANT SELECT, INSERT, UPDATE, DELETE ON roblox_rbac_db.* TO 'roblox_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON roblox_rbac_db.* TO 'roblox_app'@'127.0.0.1';
FLUSH PRIVILEGES;
