import Link from 'next/link';
import { LESSONS } from '@/lib/luauLessons';
import CodeSample from '@/components/CodeSample';

export const metadata = { title: 'เรียนภาษา Luau' };

function Block({ b }) {
  switch (b.type) {
    case 'p': return <p>{b.text}</p>;
    case 'list': return <ul className="lessonList">{b.items.map((t, i) => <li key={i}>{t}</li>)}</ul>;
    case 'code': return <CodeSample code={b.code} output={b.output} />;
    case 'tip': return <p className="callout tip"><strong>เคล็ดลับ:</strong> {b.text}</p>;
    case 'warn': return <p className="callout warn"><strong>ระวัง:</strong> {b.text}</p>;
    case 'try': return <p className="callout try"><strong>ลองทำ:</strong> {b.text}</p>;
    case 'table':
      return (
        <div className="tableWrap">
          <table className="lessonTable">
            <thead><tr>{b.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    default: return null;
  }
}

export default function LearnPage() {
  return (
    <>
      <p className="eyebrow">Luau Lessons</p>
      <h1>เรียนภาษา Luau สำหรับมือใหม่</h1>
      <p className="lead">ภาษาที่ใช้เขียนสคริปต์ใน Roblox อธิบายทีละหัวข้อ พร้อมตัวอย่างที่คัดลอกไปลองใน Studio ได้ทันที และบอกผลที่ควรเห็นใน Output</p>
      <div className="actions">
        <Link className="btn ghost small" href="/">กลับไปที่ Roadmap</Link>
        <Link className="btn ghost small" href="/scripts">ดูคลังสคริปต์</Link>
      </div>

      <div className="lessonLayout">
        <nav className="toc" aria-label="สารบัญบทเรียน">
          <h2>สารบัญ</h2>
          <ol>{LESSONS.map((l) => <li key={l.id}><a href={`#${l.id}`}>{l.title}</a></li>)}</ol>
        </nav>

        <div className="lessons">
          {LESSONS.map((l, i) => (
            <section key={l.id} id={l.id} className="lesson">
              <h2><span className="lessonNo">{i + 1}</span> {l.title}</h2>
              {l.blocks.map((b, j) => <Block key={j} b={b} />)}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
