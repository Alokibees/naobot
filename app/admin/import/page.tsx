"use client";

import { useState, useRef } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

type PreviewRow = { keywords: string[]; answer: string; valid: boolean };

export default function ImportPage() {
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ added: number; failed: number } | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function parseCSV(text: string): PreviewRow[] {
    const lines = text.trim().split("\n").filter(Boolean);
    // Skip header if it looks like one
    const start = lines[0].toLowerCase().includes("keyword") ? 1 : 0;
    return lines.slice(start).map(line => {
      // Support: "keyword1,keyword2,keyword3","answer text"
      const match = line.match(/^"([^"]+)","([^"]+)"$/) ?? line.match(/^([^,]+),(.+)$/);
      if (!match) return { keywords: [], answer: "", valid: false };
      const keywords = match[1].split("|").map(k => k.trim()).filter(Boolean);
      const answer = match[2].trim();
      return { keywords, answer, valid: keywords.length > 0 && answer.length > 0 };
    });
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(""); setResult(null); setPreview([]);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) { setError("Please upload a .csv file."); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const rows = parseCSV(ev.target?.result as string);
      if (rows.length === 0) { setError("No valid rows found."); return; }
      setPreview(rows);
    };
    reader.readAsText(file);
  }

  async function importAll() {
    const valid = preview.filter(r => r.valid);
    if (!valid.length) return;
    setImporting(true);
    let added = 0, failed = 0;
    for (const row of valid) {
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: row.keywords, answer: row.answer }),
      });
      res.ok ? added++ : failed++;
    }
    setImporting(false);
    setResult({ added, failed });
    setPreview([]);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 48px", maxWidth: 860 }}>
        <h1 style={pageTitle}>Bulk Import FAQs</h1>
        <p style={pageSub}>Upload a CSV file to add multiple FAQ entries at once.</p>

        {/* Format guide */}
        <div style={infoCard}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>📄 CSV Format</div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
            Two columns: <strong>keywords</strong> (pipe-separated) and <strong>answer</strong>. First row can be a header.
          </p>
          <pre style={codeBlock}>{`keywords,answer\nregister|sign up|enroll,"Registration opens January 1, 2026 at nao2026.in"\ndate|when|schedule,"Event is March 15–17, 2026 at Bharat Mandapam"`}</pre>
          <a href="/sample-faq.csv" download style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, marginTop: 8, display: "inline-block" }}>
            ↓ Download sample CSV
          </a>
        </div>

        {/* Upload */}
        <div style={uploadCard}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && fileRef.current) { const dt = new DataTransfer(); dt.items.add(f); fileRef.current.files = dt.files; handleFile({ target: fileRef.current } as React.ChangeEvent<HTMLInputElement>); } }}>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFile} />
          <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>Click or drag & drop your CSV</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Only .csv files supported</div>
        </div>

        {error && <div style={errorBox}>⚠ {error}</div>}

        {result && (
          <div style={successBox}>
            ✓ Import complete — <strong>{result.added}</strong> added{result.failed > 0 ? `, ${result.failed} failed` : ""}.
          </div>
        )}

        {/* Preview table */}
        {preview.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                Preview — {preview.filter(r => r.valid).length} valid / {preview.filter(r => !r.valid).length} invalid
              </div>
              <button onClick={importAll} disabled={importing || !preview.some(r => r.valid)} style={importBtn}>
                {importing ? "Importing…" : `Import ${preview.filter(r => r.valid).length} FAQs`}
              </button>
            </div>
            <div style={tableCard}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Status", "Keywords", "Answer"].map((h, i) => <th key={i} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: row.valid ? (i % 2 === 0 ? "#fff" : "#fafafa") : "#fff5f5" }}>
                      <td style={{ ...td, width: 70 }}>
                        <span style={{ fontSize: 16 }}>{row.valid ? "✅" : "❌"}</span>
                      </td>
                      <td style={{ ...td, width: 220 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {row.keywords.map(k => <span key={k} style={tag}>{k}</span>)}
                        </div>
                      </td>
                      <td style={{ ...td, fontSize: 13, color: "var(--muted)" }}>{row.answer || <em>missing</em>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const pageTitle: React.CSSProperties = { fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)" };
const pageSub: React.CSSProperties = { fontSize: 14, color: "var(--muted)", marginTop: 4 };
const infoCard: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: "18px 22px", border: "1px solid var(--border)", boxShadow: "var(--shadow)", marginTop: 24 };
const codeBlock: React.CSSProperties = { background: "var(--bg)", borderRadius: 8, padding: "10px 14px", fontSize: 12, fontFamily: "monospace", color: "var(--text)", overflowX: "auto" };
const uploadCard: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: "40px 24px", border: "2px dashed var(--border)", textAlign: "center", cursor: "pointer", marginTop: 16, transition: "border-color 0.2s" };
const errorBox: React.CSSProperties = { background: "#fdecea", color: "var(--red)", borderRadius: 10, padding: "12px 16px", fontSize: 13, marginTop: 14 };
const successBox: React.CSSProperties = { background: "#d4edda", color: "#155724", borderRadius: 10, padding: "12px 16px", fontSize: 13, marginTop: 14 };
const importBtn: React.CSSProperties = { background: "var(--red)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const tableCard: React.CSSProperties = { background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--shadow)" };
const th: React.CSSProperties = { textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.6, background: "#fafafa" };
const td: React.CSSProperties = { padding: "12px 16px", verticalAlign: "middle" };
const tag: React.CSSProperties = { background: "var(--red-light)", color: "var(--red)", borderRadius: 6, padding: "2px 7px", fontSize: 11, fontWeight: 600 };
