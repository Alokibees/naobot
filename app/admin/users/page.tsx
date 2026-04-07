"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

type User = { id: number; name: string; email: string; phone: string; created_at: string };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetch("/api/admin/users").then(r => r.json()).then(d => { setUsers(d); setLoading(false); }); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  function exportCSV() {
    const rows = [["ID", "Name", "Email", "Phone", "Joined"], ...filtered.map(u => [u.id, u.name, u.email, u.phone, new Date(u.created_at).toLocaleString()])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv); a.download = "nao2026-users.csv"; a.click();
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={pageTitle}>Users</h1>
            <p style={pageSub}>{users.length} registered participants</p>
          </div>
          <button onClick={exportCSV} style={exportBtn}>↓ Export CSV</button>
        </div>

        <input style={searchInput} placeholder="Search by name, email or phone…" value={search} onChange={e => setSearch(e.target.value)} />

        {loading ? <div style={empty}>Loading…</div> : (
          <div style={tableCard}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["#", "Name", "Email", "Phone", "Joined"].map((h, i) => <th key={i} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ ...td, color: "var(--muted)", fontSize: 12, width: 40 }}>{u.id}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                    </td>
                    <td style={{ ...td, color: "var(--muted)", fontSize: 13 }}>{u.email}</td>
                    <td style={{ ...td, fontSize: 13 }}>{u.phone}</td>
                    <td style={{ ...td, color: "var(--muted)", fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={empty}>No users found.</div>}
          </div>
        )}
      </main>
    </div>
  );
}

const pageTitle: React.CSSProperties = { fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)" };
const pageSub: React.CSSProperties = { fontSize: 14, color: "var(--muted)", marginTop: 4 };
const exportBtn: React.CSSProperties = { background: "var(--red)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const searchInput: React.CSSProperties = { width: "100%", maxWidth: 400, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, background: "#fff", outline: "none", marginBottom: 20 };
const tableCard: React.CSSProperties = { background: "#fff", borderRadius: 16, boxShadow: "var(--shadow)", overflow: "hidden", border: "1px solid var(--border)" };
const th: React.CSSProperties = { textAlign: "left", padding: "12px 18px", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.6, background: "#fafafa" };
const td: React.CSSProperties = { padding: "13px 18px", verticalAlign: "middle" };
const empty: React.CSSProperties = { textAlign: "center", padding: "48px 0", color: "var(--muted)", fontSize: 14 };
