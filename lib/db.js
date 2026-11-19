import mysql from 'mysql2/promise';

const g = globalThis;

// TiDB Cloud (public endpoint) บังคับ TLS: ตั้ง DB_SSL=true
// Node ใช้ใบรับรองรากของระบบ (Mozilla CA) อยู่แล้ว ไม่ต้องดาวน์โหลดไฟล์ CA
const ssl = process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined;

export const pool =
  g._mysqlPool ??
  (g._mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'roblox_rbac_db',
    waitForConnections: true,
    // serverless: ทุกอินสแตนซ์มี pool ของตัวเอง จึงใช้ค่าเล็กเพื่อไม่ให้ชนเพดานการเชื่อมต่อของฐานข้อมูล
    connectionLimit: Number(process.env.DB_POOL || 5),
    enableKeepAlive: true,
    idleTimeout: 60000,
    charset: 'utf8mb4',
    ssl,
  }));
