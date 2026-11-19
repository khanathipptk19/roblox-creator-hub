-- สคริปต์ตัวอย่าง 3 ตัวสำหรับหน้าคลังสคริปต์ (ต้องรัน upgrade_content.sql มาก่อนแล้ว)
USE roblox_rbac_db;

INSERT IGNORE INTO scripts (slug, title, description, placement, category, script_type, difficulty, code, explanations, mistakes, key_concepts, is_featured, sort_order) VALUES
('kill-brick', 'Kill Brick (บล็อกเหยียบแล้วตาย)',
 'บล็อกอันตรายที่ทำให้ผู้เล่นตายทันทีเมื่อสัมผัส ใช้ทำด่านกระโดดหรือกับดัก',
 'Workspace > Part (วาง Script เป็นลูกของ Part ที่ต้องการให้เป็น Kill Brick)',
 'Kill Part', 'Script', 'beginner',
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
 '[{"title":"Touched + Connect","text":"อีเวนต์ Touched ยิงเมื่อมีชิ้นส่วนมาแตะ ใช้ Connect ผูกฟังก์ชันให้ทำงานตาม"},{"title":"ค้นหาตามชนิด","text":"FindFirstChildWhichIsA ค้นหาตามคลาสแทนชื่อ ปลอดภัยกว่าเมื่อชื่อไม่แน่นอน"}]',
 1, 1),

('proximity-door', 'ProximityPrompt Door (ประตูกด E)',
 'ประตูที่ผู้เล่นเดินเข้าใกล้แล้วกด E เพื่อเปิดหรือปิด พร้อมหลักการ Debounce',
 'Workspace > Part ประตู (เพิ่ม ProximityPrompt ลงใน Part แล้ววาง Script เป็นลูกของ Part เดียวกัน)',
 'ProximityPrompt', 'Script', 'intermediate',
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
 '[{"title":"สลับสถานะด้วย not","text":"isOpen = not isOpen สลับ true/false ในบรรทัดเดียว"},{"title":"CanCollide","text":"ตั้งให้ผู้เล่นเดินผ่านได้เมื่อประตูเปิด"}]',
 0, 2),

('leaderstats', 'Leaderstats (ตารางคะแนนเหรียญ)',
 'สร้างตารางคะแนนมุมขวาบนที่แสดงจำนวนเหรียญของผู้เล่นแต่ละคน',
 'ServerScriptService > Script',
 'Leaderstats', 'Script', 'beginner',
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
 '[{"title":"ชื่อต้องตรงเป๊ะ","text":"Folder ต้องชื่อ leaderstats ตัวพิมพ์เล็กทั้งหมด"},{"title":"IntValue","text":"เก็บจำนวนเต็ม เหมาะกับเหรียญและคะแนน"}]',
 0, 3);
