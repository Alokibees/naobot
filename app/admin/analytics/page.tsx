"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

type Analytics = {
  topFaqs: { faqId: number; keyword: string; count: number; answer: string; keywords: string[] }[];
  hourly: number[];
  totalFAQHits: number;
  totalAIHits: number;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics").then(r => r.json()).then(setData);
  }, []);

  const maxHourly = data ? Math.max(...data.hourly, 1) : 1;
  const total = data ? data.totalFAQHits + data.totalAIHits : 0;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 48px" }}>
        <h1 style={pageTitle}>FAQ Analytics</h1>
        <p style={pageSub}>How NaoBot is performing in real time</p>

        {!data ? <div style={empty}>Loading…</div> : (
          <>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginTop: 28 }}>
              {[
                { label: "FAQ Hits",    value: data.totalFAQHits, color: "var(--red)",  icon: "📋" },
                { label: "AI Hits",     value: data.totalAIHits,  color: "#3b82f6",     icon: "🤖" },
                { label: "Total Chats", value: total,             color: "#10b981",     icon: "💬" },
                { label: "FAQ Rate",    value: total > 0 ? `${Math.round((data.totalFAQHits / total) * 100)}%` : "—", color: "#f59e0b", icon: "⚡" },
              ].map((c, i) => (
                <div key={i} style={statCard}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{c.icon}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: c.color, letterSpacing: "-0.03em" }}>{c.value}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Hourly bar chart */}
            <div style={card}>
              <h2 style={cardTitle}>Activity by Hour (last 24h)</h2>
              <p style={cardSub}>FAQ hits per hour of the day</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, marginTop: 20 }}>
                {data.hourly.map((v, h) => (
                  <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: "100%", borderRadius: "4px 4px 0 0",
                      background: v > 0 ? "var(--red)" : "#f0f0f5",
                      height: `${Math.max((v / maxHourly) * 64, v > 0 ? 6 : 2)}px`,
                      transition: "height 0.4s ease",
                    }} title={`${v} hits`} />
                    {h % 4 === 0 && <span style={{ fontSize: 9, color: "var(--muted)" }}>{h}h</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Top FAQs table */}
            <div style={card}>
              <h2 style={cardTitle}>Top FAQ Entries</h2>
              <p style={cardSub}>Most triggered responses</p>
              {data.topFaqs.length === 0 ? (
                <div style={{ ...empty, padding: "24px 0" }}>No FAQ hits recorded yet. Start chatting to see data.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Rank", "Keywords", "Preview", "Hits", "Share"].map((h, i) => (
                        <th key={i} style={th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.topFaqs.map((f, i) => (
                      <tr key={f.faqId} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ ...td, width: 48 }}>
                          <span style={{ fontWeight: 800, color: i === 0 ? "var(--red)" : "var(--muted)", fontSize: 14 }}>#{i + 1}</span>
                        </td>
                        <td style={{ ...td, width: 200 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {f.keywords.slice(0, 3).map(k => <span key={k} style={tag}>{k}</span>)}
                          </div>
                        </td>
                        <td style={{ ...td, color: "var(--muted)", fontSize: 13 }}>{f.answer}</td>
                        <td style={{ ...td, width: 60 }}>
                          <span style={{ fontWeight: 700, color: "var(--red)", fontSize: 16 }}>{f.count}</span>
                        </td>
                        <td style={{ ...td, width: 100 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ flex: 1, height: 6, background: "#f0f0f5", borderRadius: 99 }}>
                              <div style={{ height: "100%", width: `${Math.round((f.count / data.totalFAQHits) * 100)}%`, background: "var(--red)", borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: 11, color: "var(--muted)", minWidth: 28 }}>
                              {Math.round((f.count / data.totalFAQHits) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const pageTitle: React.CSSProperties = { fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)" };
const pageSub: React.CSSProperties = { fontSize: 14, color: "var(--muted)", marginTop: 4 };
const statCard: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: "20px 22px", boxShadow: "var(--shadow)", border: "1px solid var(--border)" };
const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: "24px 28px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", marginTop: 16 };
const cardTitle: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: "var(--text)" };
const cardSub: React.CSSProperties = { fontSize: 13, color: "var(--muted)", marginTop: 3 };
const th: React.CSSProperties = { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.6, background: "#fafafa" };
const td: React.CSSProperties = { padding: "13px 14px", verticalAlign: "middle" };
const tag: React.CSSProperties = { background: "var(--red-light)", color: "var(--red)", borderRadius: 6, padding: "2px 7px", fontSize: 11, fontWeight: 600 };
const empty: React.CSSProperties = { textAlign: "center", padding: "48px 0", color: "var(--muted)", fontSize: 14 };
