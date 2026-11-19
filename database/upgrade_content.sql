-- รันครั้งเดียวด้วย root ใน phpMyAdmin หลัง add_sources.sql (และ sample_data.sql ถ้าใช้)
USE roblox_rbac_db;

ALTER TABLE assets
  ADD COLUMN style ENUM('low_poly','anime','realistic','other') NOT NULL DEFAULT 'other',
  ADD COLUMN streaming_enabled TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN tags VARCHAR(255) NULL,
  ADD COLUMN preview_url VARCHAR(255) NULL,
  ADD COLUMN creator_verified TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE scripts
  ADD COLUMN category VARCHAR(40) NULL,
  ADD COLUMN script_type ENUM('Script','LocalScript','ModuleScript') NOT NULL DEFAULT 'Script',
  ADD COLUMN difficulty ENUM('beginner','intermediate') NOT NULL DEFAULT 'beginner',
  ADD COLUMN key_concepts LONGTEXT NULL;

ALTER TABLE roadmap_steps ADD COLUMN level VARCHAR(40) NULL;

-- ===== เติมข้อมูลฟิลด์ใหม่ให้แถวที่มีอยู่ (ข้อมูลตัวอย่าง) =====
UPDATE roadmap_steps SET level='ผู้เริ่มต้น' WHERE step_no=1;
UPDATE roadmap_steps SET level='ประกอบฉาก' WHERE step_no=2;
UPDATE roadmap_steps SET level='เขียนโค้ด' WHERE step_no=3;
UPDATE roadmap_steps SET level='เผยแพร่เกม' WHERE step_no=4;

UPDATE scripts SET category='Kill Part', key_concepts='[{"title":"Touched + Connect","text":"อีเวนต์ Touched ยิงเมื่อมีชิ้นส่วนมาแตะ ใช้ Connect ผูกฟังก์ชันให้ทำงานตาม"},{"title":"ค้นหาตามชนิด","text":"FindFirstChildWhichIsA ค้นหาตามคลาสแทนชื่อ ปลอดภัยกว่าเมื่อชื่อไม่แน่นอน"}]' WHERE slug='kill-brick';
UPDATE scripts SET category='ProximityPrompt', key_concepts='[{"title":"สลับสถานะด้วย not","text":"isOpen = not isOpen สลับ true/false ในบรรทัดเดียว"},{"title":"CanCollide","text":"ตั้งให้ผู้เล่นเดินผ่านได้เมื่อประตูเปิด"}]' WHERE slug='proximity-door';
UPDATE scripts SET category='Leaderstats', key_concepts='[{"title":"ชื่อต้องตรงเป๊ะ","text":"Folder ต้องชื่อ leaderstats ตัวพิมพ์เล็กทั้งหมด"},{"title":"IntValue","text":"เก็บจำนวนเต็ม เหมาะกับเหรียญและคะแนน"}]' WHERE slug='leaderstats';
UPDATE scripts SET category='Debounce', key_concepts='[{"title":"Debounce","text":"กันอีเวนต์ Touched ยิงซ้ำถี่ ๆ ด้วยตารางสถานะรายผู้เล่น"},{"title":"WalkSpeed","text":"ค่าปกติ 16 ปรับเพิ่มชั่วคราวแล้วคืนค่าเดิม"}]' WHERE slug='speed-pad';
UPDATE scripts SET category='Leaderstats', key_concepts='[{"title":"GetPlayerFromCharacter","text":"แปลงตัวละครเป็นผู้เล่นเพื่อเข้าถึง leaderstats"},{"title":"สถานะกันซ้ำ","text":"ตัวแปร collected กันให้คะแนนซ้ำ"}]' WHERE slug='coin-pickup';
UPDATE scripts SET category='Checkpoint', key_concepts='[{"title":"RespawnLocation","text":"กำหนดจุดเกิดใหม่รายผู้เล่น"},{"title":"SpawnLocation","text":"ต้องใช้ชนิดนี้จึงตั้งเป็นจุดเกิดได้"}]' WHERE slug='checkpoint';
UPDATE scripts SET difficulty='intermediate' WHERE slug IN ('proximity-door','speed-pad');

UPDATE assets SET style='low_poly', streaming_enabled=1, tags='building,city,low-poly' WHERE category='buildings';
UPDATE assets SET style='realistic', tags='vehicle,car,pbr' WHERE category='vehicles';
UPDATE assets SET style='low_poly', streaming_enabled=1, tags='prop,tool,weapon' WHERE category='props';
UPDATE assets SET style='anime', streaming_enabled=1, tags='nature,tree,stylized' WHERE category='nature';
UPDATE assets SET style='other', tags='gui,ui,screengui' WHERE category='gui';
UPDATE assets SET creator_verified=1 WHERE scan_status='safe' AND source_id IS NOT NULL;

UPDATE assets SET scan_report = REPLACE(scan_report, '"note"', '"remote_spam":"clean","lag_bombs":"clean","note"') WHERE scan_status='safe' AND scan_report NOT LIKE '%remote_spam%';
UPDATE assets SET scan_report = REPLACE(scan_report, '"note"', '"remote_spam":"found","lag_bombs":"clean","note"') WHERE scan_status='flagged' AND scan_report NOT LIKE '%remote_spam%';
UPDATE assets SET scan_report = REPLACE(scan_report, '"note"', '"remote_spam":"na","lag_bombs":"na","note"') WHERE scan_status='pending' AND scan_report NOT LIKE '%remote_spam%';
