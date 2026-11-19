'use client';
import { useState } from 'react';
import { DIFFICULTY } from '@/lib/utils';

export default function ScriptCard({ script, compact = false }) {
  const [copied, setCopied] = useState(false);
  const lines = script.code.split('\n');
  const kb = (new TextEncoder().encode(script.code).length / 1024).toFixed(2);
  const concepts = script.key_concepts || [];

  async function copy() {
    try { await navigator.clipboard.writeText(script.code); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  }
  function download() {
    const blob = new Blob([script.code], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${script.slug}.luau`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <article className={`scriptCard ${script.is_featured ? 'featured' : ''} ${compact ? 'compact' : ''}`}>
      <header className="scriptHead">
        <div>
          <h2>{script.title}{script.is_featured ? <span className="tag">ยอดนิยม</span> : null}</h2>
          <p>{script.description}</p>
          <ul className="metaChips">
            <li>{script.script_type}</li>
            <li>ระดับ: {DIFFICULTY[script.difficulty] || script.difficulty}</li>
            <li>{lines.length} บรรทัด · {kb} KB</li>
          </ul>
        </div>
        <div className="actions">
          <button className="btn small" onClick={copy}>{copied ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}</button>
          <button className="btn ghost small" onClick={download}>ดาวน์โหลด .luau</button>
        </div>
      </header>

      {script.placement && <p className="placement"><strong>ตำแหน่งวาง:</strong> {script.placement}</p>}

      {compact ? (
        <>
          <div className="codeTable compactCode">
            {lines.map((ln, i) => (
              <div key={i} className="codeRow simple">
                <span className="ln">{i + 1}</span>
                <code className="src">{ln || ' '}</code>
              </div>
            ))}
          </div>
          {Object.keys(script.explanations).length > 0 && (
            <details className="lineNotes">
              <summary>คำอธิบายทีละบรรทัด</summary>
              <ol>
                {Object.entries(script.explanations).map(([ln, t]) => <li key={ln}><b>บรรทัด {ln}:</b> {t}</li>)}
              </ol>
            </details>
          )}
        </>
      ) : (
        <div className="codeTable" role="table" aria-label={`โค้ด ${script.title}`}>
          <div className="codeCols" role="row"><span>บรรทัด</span><span>โค้ด</span><span>ทำไมถึงเขียนแบบนี้</span></div>
          {lines.map((ln, i) => {
            const note = script.explanations[String(i + 1)];
            return (
              <div key={i} className={`codeRow ${note ? 'hasNote' : ''}`} role="row">
                <span className="ln">{i + 1}</span>
                <code className="src">{ln || ' '}</code>
                <span className="note">{note || ''}</span>
              </div>
            );
          })}
        </div>
      )}

      {concepts.length > 0 && (
        <div className="concepts">
          <h3>สาระสำคัญ (Key Concepts)</h3>
          <ul>{concepts.map((c, i) => <li key={i}><strong>{c.title}</strong><span>{c.text}</span></li>)}</ul>
        </div>
      )}

      {script.mistakes.length > 0 && (
        <div className="mistakes">
          <h3>ข้อผิดพลาดที่มือใหม่เจอบ่อย</h3>
          <ul>{script.mistakes.map((m, i) => <li key={i}><strong>{m.title}</strong><span>{m.fix}</span></li>)}</ul>
        </div>
      )}
    </article>
  );
}
