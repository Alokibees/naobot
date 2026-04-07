"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";

type FAQ = { id: number; keywords: string[]; answer: string };

export default function FAQAdmin() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ keywords: "", answer: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/faq");
    setFaqs(await res.json());
    setLoading(false);
  }

  function flash(m: string) { setToast(m); setTimeout(() => setToast(""), 3000); }
  function startEdit(faq: FAQ) { setEditingId(faq.id); setForm({ keywords: faq.keywords.join(", "), answer: faq.answer }); }
  function startAdd() { setEditingId(0); setForm({ keywords: "", answer: "" }); }
  function cancel() { setEditingId(null); setForm({ keywords: "", answer: "" }); }

  async function save() {
    const keywords = form.keywords.split(",").map(k => k.trim()).filter(Boolean);
    if (!keywords.length || !form.answer.trim()) return;
    setSaving(true);
    await fetch("/api/admin/faq", {
      method: editingId === 0 ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingId === 0 ? { keywords, answer: form.answer } : { id: editingId, keywords, answer: form.answer }),
    });
    flash(editingId === 0 ? "FAQ added successfully." : "FAQ updated successfully.");
    setSaving(false); cancel(); load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this FAQ entry?")) return;
    await fetch("/api/admin/faq", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    flash("FAQ deleted."); load();
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const res = await fetch("/api/admin/faq/import", { method: "POST", body: text }).then(r => r.json());
    flash(`Imported ${res.added} FAQs${res.failed > 0 ? `, ${res.failed} failed` : ""}.`);
    load(); e.target.value = "";
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f7" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "48px 52px", maxWidth: 1000, overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--red)", letterSpacing: 0.3, marginBottom: 4, textTransform: "uppercase" }}>NaoBot</p>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: "#1d1d1f", lineHeight: 1 }}>FAQ Manager</h1>
            <p style={{ fontSize: 14, color: "#6e6e73", marginTop: 6 }}>{faqs.length} response{faqs.length !== 1 ? "s" : ""} configured</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <label style={importBtnStyle}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginRight: 6 }}>
                <path d="M8 2v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Import CSV
              <input type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={handleImport} />
            </label>
            <button onClick={startAdd} style={addBtnStyle}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginRight: 6 }}>
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add FAQ
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={toastStyle}>
            <div style={toastDot} />
            {toast}
          </div>
        )}

        {/* Form sheet */}
        {editingId !== null && (
          <div style={formSheet}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.01em" }}>
                {editingId === 0 ? "New FAQ Entry" : "Edit FAQ Entry"}
              </h2>
              <button onClick={cancel} style={sheetCloseBtn} aria-label="Close">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>
                  Keywords
                  <span style={{ fontWeight: 400, color: "#6e6e73", marginLeft: 6 }}>comma separated</span>
                </label>
                <input style={inputStyle} placeholder="e.g. register, sign up, enroll"
                  value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })}
                  onFocus={e => e.currentTarget.style.borderColor = "var(--red)"}
                  onBlur={e => e.currentTarget.style.borderColor = "#e0e0e5"} />
              </div>
              <div>
                <label style={labelStyle}>Answer</label>
                <textarea style={{ ...inputStyle, minHeight: 96, resize: "vertical" }}
                  placeholder="The response NaoBot will give…"
                  value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })}
                  onFocus={e => e.currentTarget.style.borderColor = "var(--red)"}
                  onBlur={e => e.currentTarget.style.borderColor = "#e0e0e5"} />
              </div>
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button onClick={save} disabled={saving} style={saveBtnStyle}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button onClick={cancel} style={cancelBtnStyle}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={skeletonWrap}>
            {[1,2,3,4].map(i => <div key={i} style={skeletonRow} />)}
          </div>
        ) : faqs.length === 0 ? (
          <div style={emptyState}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 600, fontSize: 16, color: "#1d1d1f" }}>No FAQs yet</div>
            <div style={{ fontSize: 14, color: "#6e6e73", marginTop: 6 }}>Add your first FAQ entry to get started.</div>
            <button onClick={startAdd} style={{ ...addBtnStyle, marginTop: 20 }}>+ Add FAQ</button>
          </div>
        ) : (
          <div style={tableWrap}>
            {/* Table header */}
            <div style={tableHeader}>
              <div style={{ width: 36, color: "#6e6e73", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>#</div>
              <div style={{ width: 220, color: "#6e6e73", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Keywords</div>
              <div style={{ flex: 1, color: "#6e6e73", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Answer</div>
              <div style={{ width: 130 }} />
            </div>

            {/* Rows */}
            {faqs.map((faq, i) => (
              <div key={faq.id}
                style={{ ...tableRow, background: hovered === faq.id ? "#f9f9fb" : "#fff", borderBottom: i < faqs.length - 1 ? "1px solid #f0f0f5" : "none" }}
                onMouseEnter={() => setHovered(faq.id)}
                onMouseLeave={() => setHovered(null)}>
                <div style={{ width: 36, fontSize: 12, color: "#aeaeb2", fontWeight: 500 }}>{faq.id}</div>
                <div style={{ width: 220 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {faq.keywords.map(kw => <span key={kw} style={tagStyle}>{kw}</span>)}
                  </div>
                </div>
                <div style={{ flex: 1, fontSize: 13, color: "#3a3a3c", lineHeight: 1.6, paddingRight: 16 }}>{faq.answer}</div>
                <div style={{ width: 130, display: "flex", gap: 8, justifyContent: "flex-end", opacity: hovered === faq.id ? 1 : 0, transition: "opacity 0.15s" }}>
                  <button onClick={() => startEdit(faq)} style={editBtnStyle}>Edit</button>
                  <button onClick={() => remove(faq.id)} style={deleteBtnStyle}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Styles ── */
const addBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center",
  background: "var(--red)", color: "#fff", border: "none",
  borderRadius: 980, padding: "10px 20px",
  fontWeight: 600, fontSize: 13, cursor: "pointer",
  boxShadow: "0 2px 8px rgba(192,57,43,0.25)",
  letterSpacing: "-0.01em",
};

const importBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center",
  background: "#fff", color: "#1d1d1f",
  border: "1px solid #e0e0e5", borderRadius: 980, padding: "10px 20px",
  fontWeight: 600, fontSize: 13, cursor: "pointer",
  letterSpacing: "-0.01em",
};

const toastStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  background: "#fff", border: "1px solid #e0e0e5",
  padding: "12px 18px", borderRadius: 12,
  fontSize: 13, color: "#1d1d1f", fontWeight: 500,
  marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
};

const toastDot: React.CSSProperties = {
  width: 8, height: 8, borderRadius: "50%",
  background: "#34c759", flexShrink: 0,
};

const formSheet: React.CSSProperties = {
  background: "#fff", borderRadius: 18, padding: "24px 28px",
  marginBottom: 24, border: "1px solid #e0e0e5",
  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
  maxWidth: 600,
};

const sheetCloseBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: "50%",
  background: "#f5f5f7", border: "none",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "#6e6e73",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600,
  color: "#1d1d1f", marginBottom: 8, letterSpacing: "-0.01em",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 12,
  border: "1px solid #e0e0e5", fontSize: 14,
  background: "#fafafa", outline: "none",
  boxSizing: "border-box" as const,
  transition: "border-color 0.15s",
  color: "#1d1d1f",
};

const saveBtnStyle: React.CSSProperties = {
  background: "var(--red)", color: "#fff", border: "none",
  borderRadius: 980, padding: "10px 24px",
  fontWeight: 600, fontSize: 13, cursor: "pointer",
  letterSpacing: "-0.01em",
};

const cancelBtnStyle: React.CSSProperties = {
  background: "#f5f5f7", color: "#1d1d1f", border: "none",
  borderRadius: 980, padding: "10px 20px",
  fontSize: 13, cursor: "pointer", fontWeight: 500,
};

const tableWrap: React.CSSProperties = {
  background: "#fff", borderRadius: 18,
  border: "1px solid #e0e0e5",
  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
  overflow: "hidden",
};

const tableHeader: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 16,
  padding: "12px 20px",
  background: "#fafafa",
  borderBottom: "1px solid #f0f0f5",
};

const tableRow: React.CSSProperties = {
  display: "flex", alignItems: "flex-start", gap: 16,
  padding: "16px 20px",
  transition: "background 0.12s",
};

const tagStyle: React.CSSProperties = {
  background: "#fdecea", color: "var(--red)",
  borderRadius: 6, padding: "3px 9px",
  fontSize: 11, fontWeight: 600, letterSpacing: "0.01em",
};

const editBtnStyle: React.CSSProperties = {
  background: "#f5f5f7", color: "#1d1d1f", border: "none",
  borderRadius: 8, padding: "6px 14px",
  fontSize: 12, fontWeight: 600, cursor: "pointer",
};

const deleteBtnStyle: React.CSSProperties = {
  background: "#fdecea", color: "var(--red)", border: "none",
  borderRadius: 8, padding: "6px 14px",
  fontSize: 12, fontWeight: 600, cursor: "pointer",
};

const skeletonWrap: React.CSSProperties = {
  background: "#fff", borderRadius: 18, border: "1px solid #e0e0e5",
  overflow: "hidden", padding: "8px 0",
};

const skeletonRow: React.CSSProperties = {
  height: 52, margin: "8px 20px", borderRadius: 10,
  background: "linear-gradient(90deg,#f5f5f7 25%,#ebebeb 50%,#f5f5f7 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

const emptyState: React.CSSProperties = {
  background: "#fff", borderRadius: 18, border: "1px solid #e0e0e5",
  padding: "64px 24px", textAlign: "center",
};
