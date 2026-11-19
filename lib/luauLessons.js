// เนื้อหาบทเรียนภาษา Luau (แก้ไขข้อความได้ที่ไฟล์นี้)
// ชนิดบล็อก: p, list, code{code,output}, tip, warn, try, table{head,rows}
export const LESSONS = [
  {
    id: 'intro', title: 'Luau คืออะไร',
    blocks: [
      { type: 'p', text: 'Luau คือภาษาโปรแกรมที่ใช้เขียนสคริปต์ใน Roblox พัฒนาต่อจากภาษา Lua 5.1 โครงสร้างอ่านง่าย คล้ายการเขียนประโยคภาษาอังกฤษ จึงเหมาะกับมือใหม่' },
      { type: 'p', text: 'วิธีสร้างสคริปต์แรก: ใน Explorer กดปุ่ม + ข้างชื่อ ServerScriptService แล้วเลือก Script จากนั้นพิมพ์โค้ดด้านล่างและกด Play' },
      { type: 'code', code: 'print("สวัสดี Roblox!")', output: 'สวัสดี Roblox!' },
      { type: 'tip', text: 'เปิดหน้าต่าง Output ไว้เสมอ (แท็บ View > Output) เพราะ print() และ Error ทั้งหมดจะแสดงที่นั่น' },
    ],
  },
  {
    id: 'variables', title: 'ตัวแปรและชนิดข้อมูล',
    blocks: [
      { type: 'p', text: 'ตัวแปรคือกล่องที่เก็บค่าไว้ใช้ภายหลัง ประกาศด้วยคำว่า local ตามด้วยชื่อและค่า ส่วนข้อความที่ขึ้นต้นด้วย -- คือคอมเมนต์ คอมพิวเตอร์ไม่อ่าน' },
      { type: 'code', code: 'local playerName = "Mali"   -- ข้อความ (string)\nlocal score = 10            -- ตัวเลข (number)\nlocal isAlive = true        -- จริง/เท็จ (boolean)\nlocal weapon = nil          -- ยังไม่มีค่า (nil)\n\nprint(playerName .. " มีคะแนน " .. score)', output: 'Mali มีคะแนน 10' },
      { type: 'table', head: ['ชนิด', 'ความหมาย', 'ตัวอย่าง'], rows: [
        ['string', 'ข้อความ ใส่ในเครื่องหมายคำพูด', '"สวัสดี"'],
        ['number', 'ตัวเลข ทั้งจำนวนเต็มและทศนิยม', '10, 3.5'],
        ['boolean', 'ค่าจริงหรือเท็จ', 'true, false'],
        ['nil', 'ไม่มีค่า', 'nil'],
      ] },
      { type: 'p', text: 'เครื่องหมาย .. ใช้ต่อข้อความเข้าด้วยกัน' },
      { type: 'warn', text: 'ตัวพิมพ์เล็กใหญ่มีผล score กับ Score เป็นคนละตัวแปร พิมพ์ผิดตัวเดียวก็ใช้ไม่ได้' },
      { type: 'try', text: 'สร้างตัวแปรเก็บชื่อและอายุของคุณ แล้ว print ออกมาเป็นประโยคเดียวด้วย ..' },
    ],
  },
  {
    id: 'conditions', title: 'เงื่อนไข (if)',
    blocks: [
      { type: 'p', text: 'เงื่อนไขให้โค้ดเลือกทำตามสถานการณ์ แต่ละบล็อกต้องปิดด้วย end' },
      { type: 'code', code: 'local health = 40\n\nif health <= 0 then\n\tprint("ตายแล้ว")\nelseif health < 50 then\n\tprint("เลือดน้อย")\nelse\n\tprint("ปลอดภัย")\nend', output: 'เลือดน้อย' },
      { type: 'table', head: ['เครื่องหมาย', 'ความหมาย'], rows: [
        ['==', 'เท่ากับ'], ['~=', 'ไม่เท่ากับ'], ['< > <= >=', 'น้อยกว่า / มากกว่า / น้อยกว่าหรือเท่ากับ / มากกว่าหรือเท่ากับ'],
        ['and', 'และ (ต้องจริงทั้งคู่)'], ['or', 'หรือ (จริงอย่างน้อยหนึ่งข้อ)'], ['not', 'กลับค่า จริงเป็นเท็จ'],
      ] },
      { type: 'code', code: 'local hasKey = true\nlocal level = 5\n\nif hasKey and level >= 3 then\n\tprint("เปิดประตูได้")\nend', output: 'เปิดประตูได้' },
      { type: 'warn', text: 'ใช้ == เปรียบเทียบ ส่วน = ใช้กำหนดค่าให้ตัวแปร และ "ไม่เท่ากับ" เขียนว่า ~= (ไม่ใช่ !=)' },
    ],
  },
  {
    id: 'loops', title: 'ลูป (วนซ้ำ)',
    blocks: [
      { type: 'p', text: 'ลูปใช้ทำซ้ำโดยไม่ต้องเขียนโค้ดหลายรอบ for เหมาะเมื่อรู้จำนวนรอบ while เหมาะเมื่อวนจนกว่าเงื่อนไขจะเปลี่ยน' },
      { type: 'code', code: 'for i = 1, 3 do\n\tprint("รอบที่", i)\nend', output: 'รอบที่ 1\nรอบที่ 2\nรอบที่ 3' },
      { type: 'code', code: 'local count = 0\n\nwhile count < 3 do\n\tcount += 1\n\tprint(count)\nend', output: '1\n2\n3' },
      { type: 'code', code: 'local n = 0\n\nrepeat\n\tn += 1\nuntil n >= 3\n\nprint(n)', output: '3' },
      { type: 'warn', text: 'while true do ที่ไม่มี task.wait() จะวนไม่หยุดจนเกมค้าง ถ้าต้องการวนตลอดให้ใส่เวลาพักทุกครั้ง' },
      { type: 'code', code: 'while true do\n\tprint("ทำงานทุกวินาที")\n\ttask.wait(1)\nend' },
      { type: 'try', text: 'เขียนลูป for ที่ print เลข 1 ถึง 10' },
    ],
  },
  {
    id: 'functions', title: 'ฟังก์ชัน',
    blocks: [
      { type: 'p', text: 'ฟังก์ชันคือชุดคำสั่งที่ตั้งชื่อไว้ เรียกใช้ซ้ำได้ รับค่าเข้าไป (พารามิเตอร์) และส่งผลกลับด้วย return' },
      { type: 'code', code: 'local function greet(name)\n\tprint("สวัสดี " .. name)\nend\n\ngreet("Mali")\ngreet("Somchai")', output: 'สวัสดี Mali\nสวัสดี Somchai' },
      { type: 'code', code: 'local function add(a, b)\n\treturn a + b\nend\n\nlocal result = add(2, 3)\nprint(result)', output: '5' },
      { type: 'tip', text: 'ต้องประกาศฟังก์ชันไว้เหนือบรรทัดที่เรียกใช้ ไม่เช่นนั้นจะหาฟังก์ชันไม่เจอ' },
      { type: 'try', text: 'เขียนฟังก์ชัน double ที่รับตัวเลขแล้วคืนค่าเป็นสองเท่า' },
    ],
  },
  {
    id: 'tables', title: 'Table (รายการและพจนานุกรม)',
    blocks: [
      { type: 'p', text: 'Table เก็บหลายค่าไว้ด้วยกัน ใช้ได้สองแบบ: แบบรายการ (array) และแบบมีชื่อกำกับ (dictionary)' },
      { type: 'code', code: 'local fruits = { "แอปเปิล", "กล้วย", "ส้ม" }\n\nprint(fruits[1])\nprint(#fruits)\n\ntable.insert(fruits, "องุ่น")\n\nfor index, name in ipairs(fruits) do\n\tprint(index, name)\nend', output: 'แอปเปิล\n3\n1 แอปเปิล\n2 กล้วย\n3 ส้ม\n4 องุ่น' },
      { type: 'code', code: 'local player = { name = "Mali", level = 5 }\n\nprint(player.name, player.level)\nplayer.level += 1\nprint(player.level)', output: 'Mali 5\n6' },
      { type: 'warn', text: 'ลำดับใน array เริ่มที่ 1 ไม่ใช่ 0 และ #fruits คือจำนวนสมาชิก' },
    ],
  },
  {
    id: 'events', title: 'อีเวนต์และ Debounce',
    blocks: [
      { type: 'p', text: 'อีเวนต์คือเหตุการณ์ในเกม เช่น มีคนแตะชิ้นงาน เราใช้ :Connect() ผูกฟังก์ชันไว้ให้ทำงานเมื่อเหตุการณ์นั้นเกิดขึ้น' },
      { type: 'code', code: 'local part = script.Parent\n\npart.Touched:Connect(function(otherPart)\n\tprint(otherPart.Name .. " แตะฉัน")\nend)', output: '(เมื่อมีตัวละครมาแตะ) LeftFoot แตะฉัน' },
      { type: 'p', text: 'Touched ยิงถี่มาก แตะครั้งเดียวอาจทำงานหลายสิบครั้ง วิธีกันคือ Debounce ใช้ตัวแปรจำสถานะว่ากำลังทำงานอยู่หรือไม่' },
      { type: 'code', code: 'local part = script.Parent\nlocal cooldown = false\n\npart.Touched:Connect(function()\n\tif cooldown then return end\n\tcooldown = true\n\n\tprint("ทำงานได้ครั้งเดียวต่อ 2 วินาที")\n\ttask.wait(2)\n\n\tcooldown = false\nend)' },
      { type: 'tip', text: 'ดูตัวอย่างจริงของ Debounce ได้ในสคริปต์ "ประตูกด E" ที่หน้าคลังสคริปต์' },
    ],
  },
  {
    id: 'instances', title: 'ชิ้นงานใน Roblox (Instance)',
    blocks: [
      { type: 'p', text: 'ทุกอย่างใน Explorer คือ Instance เข้าถึงผ่านโค้ดได้ ตัวที่ใช้บ่อย: script.Parent (ชิ้นงานที่สคริปต์วางอยู่), workspace (โลกของเกม) และ game:GetService("ชื่อบริการ")' },
      { type: 'code', code: 'local part = Instance.new("Part")\npart.Name = "MyPart"\npart.Size = Vector3.new(4, 1, 4)\npart.Position = Vector3.new(0, 10, 0)\npart.Anchored = true\npart.Parent = workspace' },
      { type: 'tip', text: 'กำหนด Parent เป็นบรรทัดสุดท้าย เพื่อให้ตั้งค่าอื่นเสร็จก่อนแล้วค่อยแสดงในเกม' },
      { type: 'code', code: 'local door = workspace:FindFirstChild("Door")\n\nif door then\n\tdoor:Destroy()\nend' },
      { type: 'list', items: [
        'FindFirstChild("ชื่อ") หาลูกตามชื่อ ถ้าไม่เจอได้ nil (ไม่พังทั้งสคริปต์)',
        'WaitForChild("ชื่อ") รอจนกว่าลูกนั้นจะปรากฏ เหมาะกับของที่โหลดทีหลัง',
        ':Destroy() ลบชิ้นงานออกจากเกม',
        'game:GetService("Players") เรียกใช้บริการของ Roblox เช่น Players, TweenService',
      ] },
    ],
  },
  {
    id: 'server-client', title: 'ฝั่งเซิร์ฟเวอร์และฝั่งผู้เล่น',
    blocks: [
      { type: 'p', text: 'เกม Roblox ทำงานสองฝั่ง: เซิร์ฟเวอร์ (ตัดสินผลที่ทุกคนเห็นตรงกัน) และเครื่องของผู้เล่นแต่ละคน การเลือกประเภทสคริปต์ให้ตรงงานจึงสำคัญ' },
      { type: 'table', head: ['ประเภท', 'ทำงานที่ไหน', 'วางที่ไหน'], rows: [
        ['Script', 'เซิร์ฟเวอร์', 'ServerScriptService หรือในชิ้นงานใน Workspace'],
        ['LocalScript', 'เครื่องผู้เล่น', 'StarterPlayerScripts, StarterGui, StarterCharacterScripts'],
        ['ModuleScript', 'ตามที่ผู้เรียกใช้อยู่', 'ReplicatedStorage หรือ ServerStorage'],
      ] },
      { type: 'p', text: 'ModuleScript เก็บโค้ดที่อยากใช้ซ้ำ ต้อง return ค่าออกมา และเรียกใช้ด้วย require()' },
      { type: 'code', code: '-- ModuleScript ชื่อ MathUtil ใน ReplicatedStorage\nlocal MathUtil = {}\n\nfunction MathUtil.double(n)\n\treturn n * 2\nend\n\nreturn MathUtil' },
      { type: 'code', code: '-- Script ที่เรียกใช้\nlocal MathUtil = require(game.ReplicatedStorage.MathUtil)\nprint(MathUtil.double(4))', output: '8' },
      { type: 'warn', text: 'require(ตัวเลข ID) โหลดโค้ดจากภายนอก เป็นวิธีที่ Backdoor ในโมเดลฟรีใช้บ่อย ให้ require เฉพาะ ModuleScript ที่อยู่ในเกมของคุณเอง' },
      { type: 'warn', text: 'อย่าเชื่อข้อมูลที่ฝั่งผู้เล่นส่งมา เพราะผู้โกงแก้ได้ ให้เซิร์ฟเวอร์ตรวจและตัดสินผลสำคัญ เช่น คะแนนและเงินเสมอ' },
    ],
  },
  {
    id: 'debug', title: 'อ่าน Error และแก้บั๊ก',
    blocks: [
      { type: 'p', text: 'Error คือเพื่อนที่บอกว่าโค้ดผิดตรงไหน ข้อความสีแดงใน Output จะบอกชื่อสคริปต์และเลขบรรทัด ส่วนสีส้มคือคำเตือน (Warning)' },
      { type: 'table', head: ['ข้อความที่เจอ', 'ความหมาย', 'วิธีแก้'], rows: [
        ["attempt to index nil with 'Parent'", 'ตัวแปรเป็น nil แต่ถูกใช้งาน มักหาชิ้นงานไม่เจอหรือสะกดผิด', 'เช็คชื่อใน Explorer ใช้ FindFirstChild แล้วตรวจด้วย if'],
        ['X is not a valid member of Y', 'ไม่มีลูกหรือคุณสมบัติชื่อนี้', 'ตรวจตัวพิมพ์เล็กใหญ่และชื่อที่ตั้งไว้'],
        ['Infinite yield possible on ...', 'WaitForChild รอของที่ไม่มีอยู่จริง', 'ตรวจว่ามีชิ้นงานนั้นและสะกดถูก'],
        ["Expected 'end' ...", 'ลืมปิด if / for / function ด้วย end', 'นับ end ให้ครบเท่ากับจำนวนบล็อกที่เปิด'],
        ['attempt to call a nil value', 'เรียกฟังก์ชันที่ไม่มีอยู่', 'ตรวจชื่อฟังก์ชัน และว่าประกาศไว้เหนือจุดที่เรียก'],
      ] },
      { type: 'p', text: 'เทคนิคง่าย ๆ คือใช้ print() ตรวจค่าตัวแปรระหว่างทาง ถ้าเห็น nil แปลว่าค่านั้นหาไม่เจอ' },
      { type: 'code', code: 'local door = workspace:FindFirstChild("Door")\nprint("door =", door)', output: 'door = nil   (ถ้าไม่มีชิ้นงานชื่อ Door ใน Workspace)' },
      { type: 'tip', text: 'อ่าน Error จากบรรทัดแรกก่อน และดูเลขบรรทัดที่ระบุ ปัญหามักอยู่ที่บรรทัดนั้นหรือเหนือขึ้นไปเล็กน้อย' },
    ],
  },
  {
    id: 'cheatsheet', title: 'สรุปจุดที่มือใหม่มักสับสน',
    blocks: [
      { type: 'table', head: ['เรื่อง', 'Luau เขียนอย่างไร'], rows: [
        ['ไม่เท่ากับ', '~= (ไม่ใช่ !=)'],
        ['ต่อข้อความ', '.. (ไม่ใช่ +)'],
        ['ลำดับใน array', 'เริ่มที่ 1'],
        ['จำนวนสมาชิกใน table', '#ชื่อตาราง'],
        ['บวกค่าเพิ่มทีละ 1', 'x += 1 (ไม่มี x++)'],
        ['ปิดบล็อก if / for / function', 'ใช้ end (ไม่ใช้ { })'],
        ['ไม่มีค่า', 'nil ซึ่งไม่ใช่ 0 หรือข้อความว่าง'],
        ['ตัวแปรในฟังก์ชัน', 'ควรประกาศด้วย local เสมอ'],
      ] },
      { type: 'p', text: 'อ่านจบแล้ว ลองไปคัดลอกสคริปต์จากคลังสคริปต์มาแก้ค่าดู การเปลี่ยนตัวเลขแล้วเห็นผลทันทีคือวิธีเรียนรู้ที่เร็วที่สุด' },
    ],
  },
];
