'use client';
import { useState } from 'react';

export default function CodeSample({ code, output }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  }
  return (
    <figure className="sample">
      <div className="sampleBar">
        <span>Luau</span>
        <button type="button" className="linkBtn" onClick={copy}>{copied ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}</button>
      </div>
      <div className="codeTable sampleCode">
        {lines.map((ln, i) => (
          <div key={i} className="codeRow simple">
            <span className="ln">{i + 1}</span>
            <code className="src">{ln || ' '}</code>
          </div>
        ))}
      </div>
      {output && (
        <div className="outputBox">
          <span>ผลลัพธ์ใน Output</span>
          <pre>{output}</pre>
        </div>
      )}
    </figure>
  );
}
