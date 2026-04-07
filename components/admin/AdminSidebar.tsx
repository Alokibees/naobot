"use client";

import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin",             icon: "📊", label: "Dashboard" },
  { href: "/admin/faq",         icon: "📋", label: "FAQ Manager" },
  { href: "/admin/users",       icon: "👥", label: "Users" },
  { href: "/admin/chatlogs",    icon: "💬", label: "Chat Logs" },
  { href: "/admin/analytics",   icon: "📈", label: "Analytics" },
  { href: "/admin/unanswered",  icon: "❓", label: "Unanswered" },
  { href: "/admin/import",      icon: "📥", label: "Bulk Import" },
  { href: "/admin/ai-settings", icon: "🤖", label: "AI Settings" },
  { href: "/admin/embed",       icon: "🔗", label: "Embed Code" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside style={sidebar}>
      {/* Logo */}
      <div style={{ padding: "28px 20px 20px", textAlign: "center" }}>
        <img
          src="https://nao.asdc.org.in/images/nao-logo-new.png"
          alt="NAO 2026"
          style={{ height: 40, objectFit: "contain", marginBottom: 8 }}
        />
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: 1.2,
          textTransform: "uppercase", color: "#8e8e93",
        }}>Admin Panel</div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#e5e5ea", margin: "0 16px 8px" }} />

      {/* Nav */}
      <nav style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {navItems.map(item => {
          const active = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <a key={item.href} href={item.href} style={active ? navActive : navItem}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
              <span>{item.label}</span>
              {active && <div style={activeDot} />}
            </a>
          );
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: "12px 10px 24px" }}>
        <div style={{ height: 1, background: "#e5e5ea", marginBottom: 12 }} />
        <button onClick={handleLogout} style={logoutBtn}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ── Styles ── */
const sidebar: React.CSSProperties = {
  width: 220,
  background: "#ffffff",
  borderRight: "1px solid #e5e5ea",
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
};

const navItem: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "9px 12px", borderRadius: 10,
  color: "#3a3a3c", fontSize: 13, fontWeight: 500,
  textDecoration: "none", position: "relative",
  transition: "background 0.12s",
};

const navActive: React.CSSProperties = {
  ...navItem,
  background: "#fdecea",
  color: "var(--red)",
  fontWeight: 600,
};

const activeDot: React.CSSProperties = {
  width: 6, height: 6, borderRadius: "50%",
  background: "var(--red)", marginLeft: "auto", flexShrink: 0,
};

const logoutBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  width: "100%", padding: "9px 12px", borderRadius: 10,
  background: "transparent", color: "#6e6e73",
  border: "none", fontSize: 13, fontWeight: 500,
  cursor: "pointer", textAlign: "left",
};
