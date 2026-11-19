-- รันครั้งเดียวด้วย root ใน phpMyAdmin (ต้องรัน add_sources.sql และ upgrade_content.sql มาก่อนแล้ว)
USE roblox_rbac_db;

-- ประวัติการเรียก AI แต่ละครั้ง (ใช้จำกัดจำนวนต่อวันและเป็นหลักฐานว่าใครวางข้อความอะไร)
CREATE TABLE IF NOT EXISTS ai_runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NULL,
  source_id INT NULL,
  post_url VARCHAR(255) NULL,
  raw_text MEDIUMTEXT NOT NULL,
  items_found INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_runs_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_runs_source FOREIGN KEY (source_id) REFERENCES asset_sources(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- รายการที่ AI จัดให้ รอแอดมินตรวจก่อนเข้าคลัง
CREATE TABLE IF NOT EXISTS asset_candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  run_id INT NOT NULL,
  payload LONGTEXT NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  asset_id INT NULL,
  reviewed_by INT NULL,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cand_run FOREIGN KEY (run_id) REFERENCES ai_runs(id) ON DELETE CASCADE,
  CONSTRAINT fk_cand_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
  CONSTRAINT fk_cand_user FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
