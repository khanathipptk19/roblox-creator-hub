CREATE DATABASE IF NOT EXISTS roblox_rbac_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE roblox_rbac_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS roadmap_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  step_no INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  summary TEXT,
  topics LONGTEXT COMMENT 'JSON array ของหัวข้อ',
  level VARCHAR(40) NULL,
  duration VARCHAR(40) NULL,
  goals LONGTEXT NULL,
  practice TEXT NULL,
  outcome VARCHAR(255) NULL,
  link_url VARCHAR(120) NULL,
  link_label VARCHAR(60) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS checklist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(200) NOT NULL,
  hint VARCHAR(300),
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS scripts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  placement VARCHAR(255),
  code LONGTEXT NOT NULL,
  explanations LONGTEXT COMMENT 'JSON object: {"เลขบรรทัด":"คำอธิบาย"}',
  mistakes LONGTEXT COMMENT 'JSON array: [{"title":"","fix":""}]',
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  category VARCHAR(40) NULL,
  script_type ENUM('Script','LocalScript','ModuleScript') NOT NULL DEFAULT 'Script',
  difficulty ENUM('beginner','intermediate') NOT NULL DEFAULT 'beginner',
  key_concepts LONGTEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS asset_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  platform ENUM('facebook_group','facebook_page','discord','roblox_group','other') NOT NULL DEFAULT 'other',
  url VARCHAR(255) NOT NULL,
  description TEXT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM('buildings','vehicles','props','nature','gui') NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  toolbox_id VARCHAR(30),
  file_url VARCHAR(255) COMMENT 'เช่น /models/house.rbxm (ไฟล์อยู่ใน public/models)',
  tris INT,
  mesh_optimized VARCHAR(120),
  scan_status ENUM('safe','pending','flagged') NOT NULL DEFAULT 'pending',
  scan_report LONGTEXT COMMENT 'JSON: malicious_scripts, backdoor, require_assetid, obfuscated, note',
  source_id INT NULL,
  source_post_url VARCHAR(255) NULL,
  creator_credit VARCHAR(120) NULL,
  style ENUM('low_poly','anime','realistic','other') NOT NULL DEFAULT 'other',
  streaming_enabled TINYINT(1) NOT NULL DEFAULT 0,
  tags VARCHAR(255) NULL,
  preview_url VARCHAR(255) NULL,
  creator_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_assets_source (source_id),
  CONSTRAINT fk_assets_source FOREIGN KEY (source_id) REFERENCES asset_sources(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ===================== ข้อมูลตั้งต้น =====================
INSERT INTO roadmap_steps (step_no, title, level, duration, summary, goals, practice, outcome, topics, link_url, link_label) VALUES
(1, 'รู้จัก Roblox Studio และเครื่องมือหลัก', 'ผู้เริ่มต้น', '1-2 ชั่วโมง', 'ติดตั้ง Roblox Studio (โหลดฟรีจากเว็บ Roblox หลังเข้าสู่ระบบ) แล้วทำความรู้จักหน้าต่างและเครื่องมือที่ต้องใช้ทุกวัน', '["เปิดหน้าต่างหลักให้ครบที่แท็บ View: Explorer, Properties, Output และ Toolbox", "รู้ว่าแต่ละหน้าต่างทำอะไร: Explorer แสดงทุกชิ้นงาน, Properties แก้ค่าของชิ้นงานที่เลือก, Output แสดงข้อความและ Error", "ใช้เครื่องมือ Select, Move, Scale, Rotate และเปิด Snap to Grid เพื่อวางชิ้นงานให้ตรง", "เข้าใจ Part พื้นฐาน: Size, Color, Material, Anchored (ล็อกให้ไม่ร่วง) และ CanCollide (ให้ชนได้)", "เปลี่ยนชื่อและจัดกลุ่มชิ้นงานใน Explorer ให้หาง่าย", "กด Play เพื่อทดลองเดินในเกมของตัวเอง และกด Stop เพื่อกลับมาแก้ไข"]', 'วาง Part 3-4 ก้อนทำเป็นบันไดสั้น ๆ ติ๊ก Anchored ทุกก้อน แล้วกด Play เดินขึ้นบันไดดู', 'ย้าย ปรับขนาด และล็อกชิ้นงานได้ถูกต้อง และกด Play ทดสอบเองได้', '["Explorer", "Properties", "Output", "Toolbox", "Move/Scale/Rotate", "Anchored", "CanCollide"]', NULL, NULL),
(2, 'สร้างฉากแรกและจัดแสง', 'ประกอบฉาก', '2-4 ชั่วโมง', 'ปั้นฉากเล็ก ๆ ที่เดินสำรวจได้ ปรับแสงและวัสดุให้น่าดู และจัดโครงสร้างใน Explorer ให้เป็นระเบียบ', '["ประกอบพื้น กำแพง และสิ่งก่อสร้างง่าย ๆ จาก Part ชนิดต่าง ๆ (Block, Wedge, Cylinder)", "ใช้ Terrain Editor สร้างพื้นดิน ภูเขา และน้ำ", "เลือก Material และสีให้เข้ากับธีมของฉาก", "ปรับ Lighting: ClockTime (เวลาในเกม), Brightness และเพิ่ม Atmosphere ให้บรรยากาศมีความลึก", "วาง SpawnLocation เป็นจุดเกิดของผู้เล่น", "จัดกลุ่มใน Explorer เป็น Folder เช่น Map, Props, Spawns เพื่อให้หาง่ายเมื่อเกมใหญ่ขึ้น"]', 'สร้างลานหรือห้อง 1 ฉาก มีพื้น กำแพง จุดเกิด และเปลี่ยน ClockTime เป็นช่วงเย็นเพื่อเปรียบเทียบบรรยากาศ', 'มีฉากที่ผู้เล่นเกิดและเดินสำรวจได้ และโครงสร้างใน Explorer เป็นระเบียบ', '["Map Building", "Terrain", "Materials", "Lighting", "SpawnLocation", "Folder"]', NULL, NULL),
(3, 'ใช้โมเดลสำเร็จรูปอย่างปลอดภัย', 'ระวังไว้ก่อน', '1 ชั่วโมง', 'โมเดลฟรีช่วยประหยัดเวลา แต่อาจแอบมีสคริปต์อันตราย ฝึกตรวจก่อนนำเข้าเกมทุกครั้ง', '["ค้นหาและนำโมเดลเข้าฉากจาก Toolbox หรือจากไฟล์ .rbxm", "เปิดดูใน Explorer ว่าโมเดลมี Script, LocalScript หรือ ModuleScript ซ่อนอยู่หรือไม่ (พิมพ์คำว่า Script ในช่องค้นหาของ Explorer)", "รู้จักสัญญาณอันตราย: require ตามด้วยตัวเลข ID, loadstring, โค้ดที่ถูกบีบจนอ่านไม่ออก, สคริปต์ชื่อแปลกหรือซ่อนอยู่ลึกหลายชั้น", "ลบสคริปต์ที่ไม่จำเป็นออก เมื่อโมเดลควรเป็นแค่ของตกแต่ง", "ดูรายงานการสแกนของโมเดลในหน้าโมเดลฟรีของเว็บนี้ก่อนนำไปใช้"]', 'นำโมเดลตกแต่ง 1 ชิ้นเข้าฉาก ค้นหา Script ในโมเดลนั้น ถ้ามีให้อ่านทุกบรรทัดก่อนตัดสินใจเก็บหรือลบ', 'บอกได้ว่าโมเดลที่นำเข้ามีสคริปต์หรือไม่ และรู้ว่าโค้ดแบบไหนต้องสงสัย', '["Toolbox", "require(AssetId)", "loadstring", "Backdoor", "ตรวจสคริปต์"]', '/assets', 'ไปที่คลังโมเดลฟรี'),
(4, 'เรียนรู้ภาษา Luau พื้นฐาน', 'เขียนโค้ด', '4-8 ชั่วโมง', 'Luau คือภาษาที่ใช้เขียนสคริปต์ใน Roblox เริ่มจากสิ่งที่ใช้บ่อยที่สุดก่อน แล้วค่อยต่อยอด', '["ตัวแปรด้วย local และชนิดข้อมูล: string, number, boolean, nil", "เงื่อนไข if / elseif / else และตัวเปรียบเทียบ == ~= < > and or not", "ลูป for, while, repeat และเหตุผลที่ while true do ต้องมี task.wait()", "ฟังก์ชัน: ประกาศ เรียกใช้ รับค่า และส่งค่ากลับด้วย return", "Table แบบ array (ลำดับเริ่มที่ 1) และ dictionary", "อีเวนต์และ Connect เช่น Touched เพื่อให้โค้ดทำงานเมื่อเกิดเหตุการณ์"]', 'เปิดบทเรียน Luau ในเว็บนี้ ลองพิมพ์ตัวอย่างลง Script แล้วดูผลใน Output ทีละหัวข้อ จากนั้นเขียนฟังก์ชันบวกเลขเองและวนลูป print เลข 1 ถึง 10', 'อ่านโค้ดสั้น ๆ ประมาณ 10 บรรทัดแล้วอธิบายได้ว่าแต่ละบรรทัดทำอะไร', '["Variables", "If/Else", "Loops", "Functions", "Tables", "Events"]', '/learn', 'เปิดบทเรียนภาษา Luau'),
(5, 'อ่านโค้ดและเขียนสคริปต์แรก', 'ลงมือจริง', '5-10 ชั่วโมง', 'ฝึกอ่านโค้ดของคนอื่นให้เป็น แล้วดัดแปลงและเขียนสคริปต์เล็ก ๆ ที่ตอบสนองผู้เล่นได้จริง', '["แยกประเภท Script (ฝั่งเซิร์ฟเวอร์), LocalScript (ฝั่งผู้เล่น) และ ModuleScript (โค้ดที่เรียกใช้ซ้ำ) และรู้ว่าต้องวางที่ไหน", "อ่านโค้ดทีละบรรทัด: ดูว่าตัวแปรชี้ไปที่อะไร ฟังก์ชันถูกเรียกเมื่อไร และอีเวนต์ผูกกับชิ้นงานไหน", "คัดลอกสคริปต์จากคลังสคริปต์ไปลอง แล้วแก้ค่า เช่น ความเร็ว เวลา หรือชื่อ เพื่อดูว่าผลเปลี่ยนอย่างไร", "ใช้ print() และหน้าต่าง Output หาจุดที่โค้ดผิดพลาด อ่านเลขบรรทัดใน Error ให้เป็น", "ลองสคริปต์ยอดนิยม: Kill Brick, ประตู ProximityPrompt, ตารางคะแนน leaderstats และ Debounce"]', 'ทำด่านกระโดดสั้น ๆ ที่มี Kill Brick, จุด Checkpoint และเหรียญเก็บคะแนน โดยเริ่มจากคัดลอกสคริปต์ในคลังแล้วปรับให้เข้ากับด่านของคุณ', 'แก้สคริปต์ที่คัดลอกมาแล้วเห็นผลเปลี่ยนตามที่ตั้งใจ และอ่าน Error ใน Output แล้วรู้ว่าผิดที่บรรทัดไหน', '["Script / LocalScript / ModuleScript", "อ่านโค้ด", "Debug ด้วย Output", "Touched", "ProximityPrompt", "leaderstats", "Debounce"]', '/scripts', 'ไปที่คลังสคริปต์'),
(6, 'ทดสอบ เผยแพร่ และปรับปรุงเกม', 'เผยแพร่เกม', '2-3 ชั่วโมง', 'ทดสอบให้รอบด้าน ปล่อยเกมขึ้น Roblox ชวนเพื่อนมาลอง แล้วนำเสียงตอบรับมาปรับปรุง', '["ทดสอบด้วยปุ่ม Play และ Run และจำลองผู้เล่นหลายคนที่แท็บ Test (Clients and Servers)", "อ่านหน้าต่าง Output ระหว่างทดสอบ แก้ Error และ Warning ที่เจอให้หมด", "ตั้งค่าเกมใน Game Settings เช่น ชื่อเกม คำอธิบาย และการเข้าถึง (เริ่มด้วย Private ก่อนก็ได้)", "เผยแพร่ด้วย File > Publish to Roblox", "ใช้ Team Create ชวนเพื่อนมาสร้างหรือทดสอบด้วยกัน", "จดบั๊กและข้อเสนอแนะจากเพื่อน แล้วทยอยแก้ทีละข้อ"]', 'เผยแพร่เกมเป็น Private ให้เพื่อน 1-2 คนเข้าทดสอบ แล้วจดบั๊กที่เจออย่างน้อย 3 ข้อ', 'เกมเผยแพร่แล้ว เพื่อนเข้าเล่นได้ และคุณมีรายการสิ่งที่จะปรับปรุงต่อ', '["Play / Run", "Clients and Servers", "Game Settings", "Publish to Roblox", "Team Create"]', NULL, NULL);

INSERT INTO checklist_items (label, hint, sort_order) VALUES
('ติ๊ก Anchored ให้ชิ้นงานที่ไม่ต้องการให้ร่วง', 'เลือก Part แล้วดู Properties > Anchored', 1),
('เปิดหน้าต่าง Output ไว้เสมอ', 'View > Output เพื่อดู Error สีแดงและ Warning สีเหลือง', 2),
('ตรวจ CanCollide ของพื้นและกำแพง', 'ถ้าปิด CanCollide ผู้เล่นจะทะลุผ่านไปได้', 3),
('ตั้งชื่อชิ้นงานให้สื่อความหมาย', 'เช่น KillBrick แทนที่จะเป็น Part เฉย ๆ', 4),
('แยกของเป็น Folder', 'เช่น Map, Effects, Scripts ใน Workspace', 5),
('วางสคริปต์ให้ถูกประเภทและถูกที่', 'Script ใน Workspace หรือ ServerScriptService, LocalScript ใน StarterPlayerScripts', 6),
('ตรวจสคริปต์ในโมเดลฟรีก่อนใช้ทุกครั้ง', 'ค้นหาคำว่า Script ใน Explorer และระวัง require(ตัวเลข) กับ loadstring', 7),
('กด Play (F5) ทดสอบก่อนเผยแพร่ทุกครั้ง', 'ทดสอบทั้งโหมด Play และ Run', 8);

INSERT INTO scripts (slug, title, description, placement, code, explanations, mistakes, is_featured, sort_order) VALUES
('kill-brick', 'Kill Brick (บล็อกเหยียบแล้วตาย)',
 'บล็อกอันตรายที่ทำให้ผู้เล่นตายทันทีเมื่อสัมผัส ใช้ทำด่านกระโดดหรือกับดัก',
 'Workspace > Part (วาง Script เป็นลูกของ Part ที่ต้องการให้เป็น Kill Brick)',
'local part = script.Parent

local function onTouch(otherPart)
	local humanoid = otherPart.Parent:FindFirstChildWhichIsA("Humanoid")
	if humanoid then
		humanoid.Health = 0
	end
end

part.Touched:Connect(onTouch)',
 '{"1":"script.Parent คือ Part ที่สคริปต์นี้วางอยู่ข้างใน จึงเก็บไว้ในตัวแปร part เพื่อใช้ซ้ำ","3":"สร้างฟังก์ชันที่จะทำงานทุกครั้งที่มีอะไรมาแตะ otherPart คือชิ้นส่วนที่มาแตะ เช่น เท้าหรือมือของตัวละคร","4":"otherPart.Parent คือโมเดลตัวละคร แล้วค้นหาลูกที่เป็นคลาส Humanoid ใช้ FindFirstChildWhichIsA แทนการเขียน .Humanoid ตรง ๆ เพราะถ้าไม่เจอจะได้ nil ไม่ใช่ Error และค้นตามชนิดจึงไม่พังเมื่อชื่อต่างกัน","5":"ชิ้นส่วนที่ไม่ใช่ตัวละคร เช่น ก้อนหินที่กลิ้งมาโดน จะไม่มี Humanoid ต้องเช็คก่อนเสมอ","6":"ตั้ง Health เป็น 0 ตัวละครจะตายทันที","10":"Touched คืออีเวนต์ ส่วน Connect ผูกฟังก์ชันเข้ากับอีเวนต์ เมื่อมีการแตะจะเรียก onTouch อัตโนมัติ"}',
 '[{"title":"วางสคริปต์ผิดที่","fix":"Script ต้องเป็นลูกของ Part ที่ต้องการให้ฆ่า ถ้าวางไว้ใน Workspace ตรง ๆ script.Parent จะไม่ใช่ Part"},{"title":"ไม่เช็คว่า humanoid เป็น nil","fix":"ชิ้นส่วนอื่นที่แตะบล็อกไม่มี Humanoid ต้องมี if humanoid then ครอบไว้"},{"title":"ใช้ LocalScript","fix":"ใช้ Script ปกติ (ฝั่งเซิร์ฟเวอร์) เพื่อให้การเปลี่ยน Health มีผลกับทุกคน"}]',
 1, 1),
('proximity-door', 'ProximityPrompt Door (ประตูกด E)',
 'ประตูที่ผู้เล่นเดินเข้าใกล้แล้วกด E เพื่อเปิดหรือปิด',
 'Workspace > Part ประตู (เพิ่ม ProximityPrompt ลงใน Part แล้ววาง Script เป็นลูกของ Part เดียวกัน)',
'local door = script.Parent
local prompt = door:WaitForChild("ProximityPrompt")
local TweenService = game:GetService("TweenService")

local isOpen = false
local debounce = false

prompt.Triggered:Connect(function(player)
	if debounce then return end
	debounce = true
	isOpen = not isOpen
	door.CanCollide = not isOpen
	local goal = { Transparency = isOpen and 0.7 or 0 }
	TweenService:Create(door, TweenInfo.new(0.4), goal):Play()
	prompt.ActionText = isOpen and "ปิดประตู" or "เปิดประตู"
	task.wait(0.5)
	debounce = false
end)',
 '{"2":"WaitForChild รอจนกว่า ProximityPrompt จะโหลดเสร็จ ปลอดภัยกว่าการเรียกตรง ๆ","6":"debounce คือตัวกันการทำงานซ้อน ถ้ากด E รัว ๆ จะไม่สั่งเปิดปิดทับกัน","9":"ถ้ากำลังทำงานอยู่ให้ออกจากฟังก์ชันทันที นี่คือหลักการ Debounce","12":"ประตูเปิดอยู่ให้ผู้เล่นเดินผ่านได้ จึงปิด CanCollide","14":"TweenService ทำให้ความโปร่งใสค่อย ๆ เปลี่ยนใน 0.4 วินาที แทนที่จะหายวับ","16":"หน่วงเวลาสั้น ๆ ก่อนปล่อย debounce ให้กดครั้งถัดไปได้"}',
 '[{"title":"ลืมเพิ่ม ProximityPrompt","fix":"คลิกขวาที่ Part > Insert Object > ProximityPrompt ไม่เช่นนั้น WaitForChild จะรอตลอดไป"},{"title":"ประตูไม่ Anchored","fix":"ติ๊ก Anchored ที่ประตู ไม่เช่นนั้นประตูจะร่วงหรือหลุดตำแหน่ง"}]',
 0, 2),
('leaderstats', 'Leaderstats (ตารางคะแนนเหรียญ)',
 'สร้างตารางคะแนนมุมขวาบนที่แสดงจำนวนเหรียญของผู้เล่นแต่ละคน',
 'ServerScriptService > Script',
'local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"
	leaderstats.Parent = player

	local coins = Instance.new("IntValue")
	coins.Name = "Coins"
	coins.Value = 0
	coins.Parent = leaderstats
end)',
 '{"3":"PlayerAdded ทำงานทุกครั้งที่มีผู้เล่นเข้าเกม","5":"ชื่อ leaderstats ต้องสะกดตัวพิมพ์เล็กทั้งหมด Roblox จึงจะแสดงเป็นตารางคะแนนให้","6":"กำหนด Parent เป็นบรรทัดสุดท้ายของแต่ละชิ้น เพื่อให้ตั้งค่าเสร็จก่อนค่อยแสดงผล","8":"IntValue เก็บจำนวนเต็ม เหมาะกับเหรียญหรือคะแนน","11":"ใส่ Coins ไว้ใน leaderstats ชื่อและค่าจะโผล่ในตารางโดยอัตโนมัติ"}',
 '[{"title":"พิมพ์ Leaderstats ตัวใหญ่","fix":"ต้องเป็น leaderstats ตัวพิมพ์เล็กทั้งหมด ไม่เช่นนั้นตารางจะไม่ขึ้น"},{"title":"วางสคริปต์ใน LocalScript","fix":"ใช้ Script ใน ServerScriptService เพื่อให้ค่าตรงกันทุกคน"}]',
 0, 3),
('speed-pad', 'Speed Boost Pad (แผ่นเร่งความเร็ว)',
 'แผ่นพื้นที่ทำให้ผู้เล่นวิ่งเร็วขึ้นชั่วคราว',
 'Workspace > Part (วาง Script เป็นลูกของ Part)',
'local pad = script.Parent
local BOOST_SPEED = 50
local NORMAL_SPEED = 16
local DURATION = 3
local debounce = {}

pad.Touched:Connect(function(hit)
	local humanoid = hit.Parent:FindFirstChildWhichIsA("Humanoid")
	if not humanoid or debounce[humanoid] then return end
	debounce[humanoid] = true
	humanoid.WalkSpeed = BOOST_SPEED
	task.wait(DURATION)
	humanoid.WalkSpeed = NORMAL_SPEED
	debounce[humanoid] = nil
end)',
 '{"2":"ตัวพิมพ์ใหญ่คือค่าคงที่ที่ปรับแต่งได้ง่ายโดยไม่ต้องแก้ตรรกะ","5":"Touched ยิงถี่มาก ใช้ตาราง debounce แยกตามผู้เล่นเพื่อไม่ให้ซ้อนกัน","7":"ผูกฟังก์ชันกับอีเวนต์ Touched ของแผ่น","9":"ถ้าไม่ใช่ตัวละคร หรือกำลังได้บูสต์อยู่ ให้ข้ามไป","12":"รอ 3 วินาทีโดยไม่บล็อกสคริปต์อื่น","13":"คืนความเร็วปกติ ค่าเริ่มต้นของ WalkSpeed คือ 16"}',
 '[{"title":"ไม่ใช้ debounce","fix":"Touched ยิงซ้ำหลายครั้งต่อวินาที ทำให้ตั้งความเร็วและรอซ้อนกันจนค่าเพี้ยน"},{"title":"ลืมคืนความเร็ว","fix":"ต้องตั้ง WalkSpeed กลับหลังหมดเวลาเสมอ"}]',
 0, 4);

INSERT INTO assets (category, name, description, toolbox_id, file_url, tris, mesh_optimized, scan_status, scan_report) VALUES
('buildings', 'บ้านสองชั้นโลว์โพลี', 'ข้อมูลตัวอย่าง: บ้านสไตล์โลว์โพลีพร้อมเฟอร์นิเจอร์พื้นฐาน', '123456789', NULL, 4200, 'ผ่าน (MeshPart รวมชิ้น)', 'safe', '{"malicious_scripts":0,"backdoor":"clean","require_assetid":"clean","obfuscated":"clean","note":"ไม่มีสคริปต์ในโมเดล"}'),
('buildings', 'หอคอยปราสาท', 'ข้อมูลตัวอย่าง: หอคอยหินสำหรับแมพแฟนตาซี', '123456790', NULL, 6800, 'ผ่าน', 'safe', '{"malicious_scripts":0,"backdoor":"clean","require_assetid":"clean","obfuscated":"clean","note":"มี Script ไฟคบเพลิง 1 ตัว ตรวจแล้วปลอดภัย"}'),
('vehicles', 'รถสปอร์ตเปล่า', 'ข้อมูลตัวอย่าง: โมเดลรถไม่มีสคริปต์ขับ ใส่ระบบขับเองได้', '123456791', NULL, 9500, 'ควรลด Tris เพิ่ม', 'safe', '{"malicious_scripts":0,"backdoor":"clean","require_assetid":"clean","obfuscated":"clean","note":"ไม่มีสคริปต์"}'),
('vehicles', 'เรือใบ', 'ข้อมูลตัวอย่าง: เรือใบเล็กสำหรับแมพทะเลสาบ', '123456792', NULL, 3100, 'ผ่าน', 'pending', '{"malicious_scripts":0,"backdoor":"na","require_assetid":"na","obfuscated":"na","note":"รอการสแกน"}'),
('props', 'ดาบไม้ฝึกซ้อม', 'ข้อมูลตัวอย่าง: พร็อพอาวุธ Tool พร้อมใช้', '123456793', NULL, 900, 'ผ่าน', 'safe', '{"malicious_scripts":0,"backdoor":"clean","require_assetid":"clean","obfuscated":"clean","note":"Script โจมตีพื้นฐาน 1 ตัว ตรวจแล้วปลอดภัย"}'),
('nature', 'ต้นสนชุด 5 แบบ', 'ข้อมูลตัวอย่าง: ต้นสนหลายขนาด', '123456794', NULL, 1200, 'ผ่าน', 'safe', '{"malicious_scripts":0,"backdoor":"clean","require_assetid":"clean","obfuscated":"clean","note":"ไม่มีสคริปต์"}'),
('nature', 'ก้อนหินและพุ่มไม้', 'ข้อมูลตัวอย่าง: ชุดตกแต่งพื้น', '123456795', NULL, 700, 'ผ่าน', 'safe', '{"malicious_scripts":0,"backdoor":"clean","require_assetid":"clean","obfuscated":"clean","note":"ไม่มีสคริปต์"}'),
('gui', 'แถบเลือดและเหรียญ', 'ข้อมูลตัวอย่าง: ScreenGui แถบ HP และตัวนับเหรียญ', '123456796', NULL, NULL, 'ไม่เกี่ยวข้อง (GUI)', 'flagged', '{"malicious_scripts":1,"backdoor":"found","require_assetid":"found","obfuscated":"clean","note":"พบ require(AssetId) ใน LocalScript ห้ามนำไปใช้จนกว่าจะแก้ไข"}');

-- ===== เติมข้อมูลฟิลด์ใหม่ให้แถวที่มีอยู่ (ข้อมูลตัวอย่าง) =====

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

-- ===== คิวรอตรวจจาก AI =====


-- ประวัติการเรียก AI แต่ละครั้ง (ใช้จำกัดจำนวนต่อวันและเป็นหลักฐานว่าใครวางข้อความอะไร)
CREATE TABLE IF NOT EXISTS ai_runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NULL,
  source_id INT NULL,
  post_url VARCHAR(255) NULL,
  raw_text MEDIUMTEXT NOT NULL,
  items_found INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_runs_admin (admin_id),
  INDEX idx_runs_source (source_id),
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
  INDEX idx_cand_run (run_id),
  INDEX idx_cand_asset (asset_id),
  INDEX idx_cand_user (reviewed_by),
  CONSTRAINT fk_cand_run FOREIGN KEY (run_id) REFERENCES ai_runs(id) ON DELETE CASCADE,
  CONSTRAINT fk_cand_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
  CONSTRAINT fk_cand_user FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ===== สถิติการใช้งาน (จัดอันดับหน้าแรก) =====


CREATE TABLE IF NOT EXISTS item_usage (
  user_id INT NOT NULL,
  kind ENUM('script','asset') NOT NULL,
  item_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, kind, item_id),
  INDEX idx_usage_item (kind, item_id)
) ENGINE=InnoDB;
