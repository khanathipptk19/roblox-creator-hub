-- เก็บว่า "ผู้ใช้คนไหนเคยใช้ของชิ้นไหน" (คัดลอกสคริปต์ / ดาวน์โหลดโมเดล) ใช้จัดอันดับหน้าแรก
-- คนละ 1 ครั้งต่อ 1 ชิ้น จึงนับเป็นจำนวน "คนที่ใช้งาน" ไม่ใช่จำนวนครั้งที่กด
USE roblox_rbac_db;

CREATE TABLE IF NOT EXISTS item_usage (
  user_id INT NOT NULL,
  kind ENUM('script','asset') NOT NULL,
  item_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, kind, item_id),
  INDEX idx_usage_item (kind, item_id)
) ENGINE=InnoDB;
