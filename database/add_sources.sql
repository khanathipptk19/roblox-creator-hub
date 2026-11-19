-- รันครั้งเดียว ด้วยบัญชี root ใน phpMyAdmin (แท็บ SQL) กับฐานข้อมูลที่สร้างไว้แล้ว
USE roblox_rbac_db;

CREATE TABLE IF NOT EXISTS asset_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  platform ENUM('facebook_group','facebook_page','discord','roblox_group','other') NOT NULL DEFAULT 'other',
  url VARCHAR(255) NOT NULL,
  description TEXT
) ENGINE=InnoDB;

ALTER TABLE assets
  ADD COLUMN source_id INT NULL,
  ADD COLUMN source_post_url VARCHAR(255) NULL,
  ADD COLUMN creator_credit VARCHAR(120) NULL,
  ADD CONSTRAINT fk_assets_source FOREIGN KEY (source_id) REFERENCES asset_sources(id) ON DELETE SET NULL;
