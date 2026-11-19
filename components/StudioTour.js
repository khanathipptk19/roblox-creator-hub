'use client';
import { useState } from 'react';

const PANELS = {
  toolbox: { name: 'ToolBox', text: 'คลังโมเดล ปลั๊กอิน และเสียง ใช้ค้นหาของมาวางในฉาก ควรเลือกจากแหล่งที่เชื่อถือได้และตรวจสคริปต์ในโมเดลทุกครั้ง' },
  explorer: { name: 'Explorer', text: 'แผนผังต้นไม้ของทุกอย่างในเกม เช่น Workspace, Lighting, ServerScriptService ใช้เลือก จัดกลุ่ม และเพิ่มสคริปต์ให้ชิ้นงาน' },
  viewport: { name: 'Viewport', text: 'พื้นที่ทำงานหลักที่เห็นฉาก ใช้เครื่องมือ Move, Scale, Rotate ขยับชิ้นงาน Part ได้ที่นี่' },
  properties: { name: 'Properties', text: 'ค่าของชิ้นงานที่เลือก เช่น Size, Color, Material รวมถึง Anchored (ล็อกไม่ให้ร่วง) และ CanCollide (ให้ชนได้หรือทะลุ)' },
  output: { name: 'Output', text: 'หน้าต่างแสดงข้อความจาก print() และ Error สีแดงเมื่อสคริปต์ผิดพลาด เปิดไว้เสมอเวลาเขียนโค้ด' },
};

export default function StudioTour() {
  const [active, setActive] = useState('explorer');
  const P = ({ id, className = '', children }) => (
    <button type="button" className={`tourPanel ${className} ${active === id ? 'on' : ''}`} onClick={() => setActive(id)} aria-pressed={active === id}>
      <span className="tourName">{PANELS[id].name}</span>{children}
    </button>
  );
  return (
    <div className="tour">
      <div className="studio">
        <div className="studioBar"><i /><i /><i /> Roblox Studio</div>
        <div className="studioGrid">
          <P id="toolbox" className="gToolbox"><span className="fake">Models · Audio · Plugins</span></P>
          <P id="viewport" className="gView"><span className="baseplate" /><span className="partBox" /></P>
          <P id="explorer" className="gExplorer">
            <ul className="tree"><li>Workspace</li><li className="in">Baseplate</li><li className="in">KillBrick</li><li>Lighting</li><li>ServerScriptService</li></ul>
          </P>
          <P id="properties" className="gProps">
            <ul className="props"><li>Anchored <b>true</b></li><li>CanCollide <b>true</b></li><li>Material <b>Plastic</b></li><li>Size <b>4, 1, 4</b></li></ul>
          </P>
          <P id="output" className="gOut"><span className="fake">&gt; Hello, Creator!<br />&gt; [Warning] Part ยังไม่ Anchored</span></P>
        </div>
      </div>
      <div className="tourInfo" aria-live="polite">
        <h3>{PANELS[active].name}</h3>
        <p>{PANELS[active].text}</p>
        <p className="tip">เคล็ดลับ: ถ้าหน้าต่างไหนหายไป ให้เปิดกลับที่แท็บ View ด้านบนของ Studio</p>
      </div>
    </div>
  );
}
