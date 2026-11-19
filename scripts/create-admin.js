// ใช้: npm run create-admin -- you@example.com "ชื่อ" "รหัสผ่านอย่างน้อย8ตัว"
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

(async () => {
  const [email, name, password] = process.argv.slice(2);
  if (!email || !name || !password || password.length < 8) {
    console.error('ใช้: npm run create-admin -- <email> <ชื่อ> <รหัสผ่าน(>=8ตัว)>');
    process.exit(1);
  }
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'roblox_rbac_db',
  });
  const hash = await bcrypt.hash(password, 12);
  await db.query(
    `INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = 'admin'`,
    [email.toLowerCase(), name, hash]
  );
  console.log('สร้าง/อัปเดตแอดมินแล้ว:', email);
  await db.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
