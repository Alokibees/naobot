"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

type Log = { id: number; question: string; answer: string; source: "faq" | "ai"; created_at: string };

export default function ChatLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "faq" | "ai">("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => { fetch("/api/admin/chatlogs").then(r => r.json()).then(d => { setLogs(d); setLoading(false); }); }, []);

  const filtered = logs.filter(l => {
    const matchSearch = l.question.toLowerCase().includes(search.toLowerCase()) || l.answer.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || l.source === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 48px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={pageTitle}>Chat Logs</h1>
          <p style={pageSub}>{logs.length} total conversations</p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <input style={searchInput} placeholder="Search questions or answers…" value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "faq", "ai"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={filter === f ? filterActive : filterBtn}>
                {f === "all" ? "All" : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div style={empty}>Loading…</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(log => (
              <div key={log.id} style={logCard} onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>
                      {log.question}
                    </div>
                    {expanded === log.id && (
                      <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                        {log.answer}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    <span style={log.source === "faq" ? faqBadge : aiBadge}>
                      {log.source === "faq" ? "FAQ" : "AI"}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div style={empty}>No logs found.</div>}
          </div>
        )}
      </main>
    </div>
  );
}

const pageTitle: React.CSSProperties = { fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)" };
const pageSub: React.CSSProperties = { fontSize: 14, color: "var(--muted)", marginTop: 4 };
const searchInput: React.CSSProperties = { flex: 1, minWidth: 200, maxWidth: 360, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, background: "#fff", outline: "none" };
const filterBtn: React.CSSProperties = { padding: "9px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--muted)" };
const filterActive: React.CSSProperties = { ...filterBtn, background: "var(--red)", color: "#fff", border: "1px solid var(--red)" };
const logCard: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", cursor: "pointer" };
const faqBadge: React.CSSProperties = { background: "var(--red-light)", color: "var(--red)", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 };
const aiBadge: React.CSSProperties = { background: "#eff6ff", color: "#3b82f6", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 };
const empty: React.CSSProperties = { textAlign: "center", padding: "48px 0", color: "var(--muted)", fontSize: 14 };
