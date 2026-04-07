"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

type Hit = { question: string; timestamp: Date };
type AddingState = { question: string; keywords: string; answer: string } | null;

export default function UnansweredPage() {
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<AddingState>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/admin/unanswered").then(r => r.json()).then(d => { setHits(d); setLoading(false); });
  }, []);

  function flash(m: string) { setToast(m); setTimeout(() => setToast(""), 3000); }

  function startAdd(question: string) {
    // Pre-fill keywords from the question words
    const keywords = question.toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter(w => w.length > 3)
      .slice(0, 4)
      .join(", ");
    setAdding({ question, keywords, answer: "" });
  }

  async function saveToFAQ() {
    if (!adding) return;
    const keywords = adding.keywords.split(",").map(k => k.trim()).filter(Boolean);
    if (!keywords.length || !adding.answer.trim()) return;
    setSaving(true);
    await fetch("/api/admin/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords, answer: adding.answer.trim() }),
    });
    setSaving(false);
    setAdding(null);
    flash(`Added "${adding.question.slice(0, 40)}…" to FAQ.`);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 48px", maxWidth: 860 }}>
        <h1 style={pageTitle}>Unanswered Questions</h1>
        <p style={pageSub}>Questions NaoBot sent to AI — add them to FAQ for instant responses next time.</p>

        {toast && <div style={toastStyle}>✓ {toast}</div>}

        {/* Add to FAQ inline form */}
        {adding && (
          <div style={formCard}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Adding FAQ for:</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 16, padding: "10px 14px", background: "var(--bg)", borderRadius: 8 }}>
              "{adding.question}"
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={label}>Keywords <span style={{ color: "var(--muted)", fontWeight: 400 }}>— comma separated</span></label>
                <input style={inputStyle} value={adding.keywords}
                  onChange={e => setAdding({ ...adding, keywords: e.target.value })} />
              </div>
              <div>
                <label style={label}>Answer</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                  placeholder="Type the answer NaoBot should give…"
                  value={adding.answer}
                  onChange={e => setAdding({ ...adding, answer: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveToFAQ} disabled={saving} style={saveBtn}>{saving ? "Saving…" : "Add to FAQ"}</button>
                <button onClick={() => setAdding(null)} style={cancelBtn}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {loading ? <div style={empty}>Loading…</div> : hits.length === 0 ? (
          <div style={emptyCard}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>All questions are covered!</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>No AI-only questions yet. NaoBot is handling everything via FAQ.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
            {hits.map((h, i) => (
              <div key={i} style={row}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{h.question}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                    {new Date(h.timestamp).toLocaleString()}
                  </div>
                </div>
                <button onClick={() => startAdd(h.question)} style={addBtn}>
                  + Add to FAQ
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const pageTitle: React.CSSProperties = { fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)" };
const pageSub: React.CSSProperties = { fontSize: 14, color: "var(--muted)", marginTop: 4, marginBottom: 0 };
const toastStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, background: "#d4edda", color: "#155724", padding: "12px 18px", borderRadius: 10, fontSize: 13, marginTop: 20, marginBottom: 4 };
const formCard: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", marginTop: 20, maxWidth: 560 };
const label: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, background: "#fafafa", outline: "none", boxSizing: "border-box" as const };
const saveBtn: React.CSSProperties = { background: "var(--red)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const cancelBtn: React.CSSProperties = { background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 16px", fontSize: 13, cursor: "pointer" };
const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "var(--shadow)", border: "1px solid var(--border)" };
const addBtn: React.CSSProperties = { background: "var(--red-light)", color: "var(--red)", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 };
const empty: React.CSSProperties = { textAlign: "center", padding: "48px 0", color: "var(--muted)", fontSize: 14 };
const emptyCard: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: "48px 24px", textAlign: "center", boxShadow: "var(--shadow)", border: "1px solid var(--border)", marginTop: 24 };
