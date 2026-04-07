"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

type Stats = {
  totalUsers: number; totalChats: number;
  faqHits: number; aiHits: number; faqRate: number;
  todayUsers: number; todayChats: number; totalFaqs: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(setStats);
  }, []);

  const cards = stats ? [
    { icon: "👥", label: "Total Users",    value: stats.totalUsers,  sub: `+${stats.todayUsers} today`,  color: "#3b82f6" },
    { icon: "💬", label: "Total Chats",    value: stats.totalChats,  sub: `+${stats.todayChats} today`,  color: "#10b981" },
    { icon: "📋", label: "FAQ Entries",    value: stats.totalFaqs,   sub: "Active responses",            color: "var(--red)" },
    { icon: "⚡", label: "FAQ Hit Rate",   value: `${stats.faqRate}%`, sub: `${stats.faqHits} FAQ · ${stats.aiHits} AI`, color: "#f59e0b" },
  ] : [];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 48px" }}>
        <h1 style={pageTitle}>Dashboard</h1>
        <p style={pageSub}>Welcome back — here's what's happening with NaoBot.</p>

        {!stats ? (
          <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 40 }}>Loading…</div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginTop: 32 }}>
              {cards.map((c, i) => (
                <div key={i} style={statCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 28 }}>{c.icon}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{c.label}</div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: c.color, letterSpacing: "-0.03em", marginTop: 12 }}>{c.value}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* FAQ vs AI bar */}
            <div style={{ ...sectionCard, marginTop: 28 }}>
              <h2 style={sectionTitle}>FAQ vs AI Breakdown</h2>
              <p style={sectionSub}>How NaoBot is answering questions</p>
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
                  <span>FAQ Responses ({stats.faqRate}%)</span>
                  <span>AI Responses ({100 - stats.faqRate}%)</span>
                </div>
                <div style={{ height: 10, background: "#f0f0f5", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${stats.faqRate}%`, background: "var(--red)", borderRadius: 99, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
                  <div style={legendItem}><div style={{ ...dot, background: "var(--red)" }} /> FAQ ({stats.faqHits})</div>
                  <div style={legendItem}><div style={{ ...dot, background: "#94a3b8" }} /> AI ({stats.aiHits})</div>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              {[
                { href: "/admin/faq",      icon: "📋", title: "Manage FAQs",   desc: `${stats.totalFaqs} entries` },
                { href: "/admin/users",    icon: "👥", title: "View Users",    desc: `${stats.totalUsers} registered` },
                { href: "/admin/chatlogs", icon: "💬", title: "Chat Logs",     desc: `${stats.totalChats} conversations` },
              ].map((l, i) => (
                <a key={i} href={l.href} style={quickLink}>
                  <span style={{ fontSize: 24 }}>{l.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{l.title}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{l.desc}</div>
                  </div>
                  <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 18 }}>›</span>
                </a>
              ))}
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
const sectionCard: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: "24px 28px", boxShadow: "var(--shadow)", border: "1px solid var(--border)" };
const sectionTitle: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" };
const sectionSub: React.CSSProperties = { fontSize: 13, color: "var(--muted)", marginTop: 3 };
const legendItem: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" };
const dot: React.CSSProperties = { width: 8, height: 8, borderRadius: "50%" };
const quickLink: React.CSSProperties = { display: "flex", alignItems: "center", gap: 14, background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", textDecoration: "none", transition: "box-shadow 0.15s" };
