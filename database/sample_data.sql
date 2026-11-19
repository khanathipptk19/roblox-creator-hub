-- ข้อมูลตัวอย่างสำหรับทดลอง (หลังรัน add_sources.sql แล้ว) รันครั้งเดียว
-- ลิงก์ REPLACE_ME และ Toolbox ID 9000000xx เป็นค่าสมมติ ให้แก้ในหน้าแอดมินเป็นของจริง
USE roblox_rbac_db;

INSERT IGNORE INTO asset_sources (id, name, platform, url, description) VALUES
(1, 'กลุ่มแจกโมเดล Roblox (ตัวอย่าง)', 'facebook_group', 'https://www.facebook.com/groups/REPLACE_ME', 'ข้อมูลตัวอย่าง: กลุ่มที่สมาชิกโพสต์แจกโมเดลฟรี'),
(2, 'เพจโมเดลฟรี Roblox (ตัวอย่าง)', 'facebook_page', 'https://www.facebook.com/REPLACE_ME', 'ข้อมูลตัวอย่าง: เพจรวมโมเดลและพร็อพ'),
(3, 'ชุมชนผู้สร้างเกม (ตัวอย่าง)', 'roblox_group', 'https://www.roblox.com/communities/REPLACE_ME', 'ข้อมูลตัวอย่าง: กลุ่มบน Roblox');

INSERT INTO assets (category, name, description, source_id, source_post_url, creator_credit, toolbox_id, tris, mesh_optimized, scan_status, scan_report) VALUES
('buildings', 'ร้านค้าริมทาง (ทดลอง)', 'ข้อมูลตัวอย่าง: ร้านค้าเล็กสำหรับแมพเมือง', 1, 'https://www.facebook.com/groups/REPLACE_ME/posts/1', 'ผู้สร้างตัวอย่าง A', '900000001', 3600, 'ผ่าน', 'safe',
 '{"malicious_scripts":0,"backdoor":"clean","require_assetid":"clean","obfuscated":"clean","note":"ไม่มีสคริปต์"}'),
('vehicles', 'มอเตอร์ไซค์โลว์โพลี (ทดลอง)', 'ข้อมูลตัวอย่าง: ยังไม่ได้ตรวจสคริปต์', 1, NULL, 'ผู้สร้างตัวอย่าง B', '900000002', 5200, 'ควรลด Tris', 'pending',
 '{"malicious_scripts":0,"backdoor":"na","require_assetid":"na","obfuscated":"na","note":"รอการสแกน"}'),
('props', 'หีบสมบัติพร้อมสคริปต์เปิดฝา (ทดลอง)', 'ข้อมูลตัวอย่าง: มีสคริปต์ 1 ตัว ตรวจแล้ว', 2, 'https://www.facebook.com/REPLACE_ME/posts/2', 'ผู้สร้างตัวอย่าง C', '900000003', 1500, 'ผ่าน', 'safe',
 '{"malicious_scripts":0,"backdoor":"clean","require_assetid":"clean","obfuscated":"clean","note":"Script เปิดฝา 1 ตัว ไม่มีการเรียกภายนอก"}'),
('nature', 'ชุดต้นไม้ฤดูหนาว (ทดลอง)', 'ข้อมูลตัวอย่าง: ต้นสนมีหิมะ 4 แบบ', 2, NULL, 'ผู้สร้างตัวอย่าง C', '900000004', 1800, 'ผ่าน', 'safe',
 '{"malicious_scripts":0,"backdoor":"clean","require_assetid":"clean","obfuscated":"clean","note":"ไม่มีสคริปต์"}'),
('gui', 'เมนูหลักเกม (ทดลอง)', 'ข้อมูลตัวอย่างสำหรับทดสอบป้ายสีแดง: ห้ามใช้', 3, NULL, 'ผู้สร้างตัวอย่าง D', '900000005', NULL, 'ไม่เกี่ยวข้อง', 'flagged',
 '{"malicious_scripts":2,"backdoor":"found","require_assetid":"found","obfuscated":"found","note":"พบ require(AssetId) และโค้ด obfuscated ห้ามนำไปใช้"}'),
('props', 'กระบองของเล่น (ทดลอง)', 'ข้อมูลตัวอย่าง: รอสแกน', 3, NULL, NULL, '900000006', 700, 'ผ่าน', 'pending',
 '{"malicious_scripts":0,"backdoor":"na","require_assetid":"na","obfuscated":"na","note":"รอการสแกน"}');

-- สคริปต์ตัวอย่างเพิ่ม 2 ตัวสำหรับทดลองหน้าคลังสคริปต์
INSERT IGNORE INTO scripts (slug, title, description, placement, code, explanations, mistakes, is_featured, sort_order) VALUES
('coin-pickup', 'Coin Pickup (เหรียญเก็บได้)', 'เหรียญที่ผู้เล่นแตะแล้วได้คะแนนใน leaderstats แล้วหายไป',
 'Workspace > Part เหรียญ (ต้องมี leaderstats และ Coins จากสคริปต์ Leaderstats)',
'local coin = script.Parent
local VALUE = 1
local collected = false

coin.Touched:Connect(function(hit)
	if collected then return end
	local player = game:GetService("Players"):GetPlayerFromCharacter(hit.Parent)
	if not player then return end
	local stats = player:FindFirstChild("leaderstats")
	local coins = stats and stats:FindFirstChild("Coins")
	if not coins then return end
	collected = true
	coins.Value += VALUE
	coin:Destroy()
end)',
 '{"3":"ตัวแปรกันเก็บซ้ำ ถ้าหลายคนแตะพร้อมกัน เหรียญจะให้คะแนนแค่ครั้งเดียว","5":"ผูกฟังก์ชันกับอีเวนต์ Touched ของเหรียญ","7":"แปลงชิ้นส่วนที่มาแตะให้เป็นผู้เล่น ถ้าเป็นของอย่างอื่นจะได้ nil","10":"ใช้ and ป้องกัน Error เมื่อยังไม่มี leaderstats","12":"ตั้งค่าก่อนให้คะแนนเพื่อกันการทำงานซ้อน","14":"ลบเหรียญหลังเก็บ"}',
 '[{"title":"ไม่มี leaderstats","fix":"ต้องมีสคริปต์ Leaderstats ใน ServerScriptService ก่อน ไม่เช่นนั้นเหรียญจะไม่ทำงานเงียบ ๆ"},{"title":"ลืมกันเก็บซ้ำ","fix":"ใช้ตัวแปร collected ไม่เช่นนั้นเหรียญเดียวอาจให้คะแนนหลายครั้ง"}]',
 0, 5),
('checkpoint', 'Checkpoint (จุดเกิดใหม่)', 'แตะแล้วจุดเกิดใหม่ของผู้เล่นเปลี่ยนเป็นจุดนี้ เหมาะกับด่านกระโดด',
 'Workspace > SpawnLocation (วาง Script เป็นลูกของ SpawnLocation)',
'local checkpoint = script.Parent
local Players = game:GetService("Players")

checkpoint.Touched:Connect(function(hit)
	local player = Players:GetPlayerFromCharacter(hit.Parent)
	if player and player.RespawnLocation ~= checkpoint then
		player.RespawnLocation = checkpoint
	end
end)',
 '{"4":"ผูกกับอีเวนต์ Touched ของจุดเช็คพอยต์","5":"หาผู้เล่นจากตัวละครที่มาแตะ","6":"เช็คก่อนว่ายังไม่ได้ตั้งเป็นจุดนี้ เพื่อไม่ให้ตั้งซ้ำทุกครั้งที่ Touched ยิง","7":"RespawnLocation คือจุดที่ผู้เล่นจะเกิดหลังตาย"}',
 '[{"title":"ใช้ Part ธรรมดา","fix":"ต้องเป็น SpawnLocation จึงตั้งเป็น RespawnLocation ได้"},{"title":"ไม่ปิด Neutral","fix":"ถ้าตั้ง Neutral เป็น true แล้วทีมไม่ตรง ผู้เล่นอาจไปเกิดที่อื่น"}]',
 0, 6);
