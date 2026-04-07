"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push("/admin/faq");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="https://nao.asdc.org.in/images/nao-logo-new.png" alt="NAO 2026" style={{ height: 60, objectFit: "contain", marginBottom: 12 }} />
          <p style={subtitleStyle}>National Automobile Olympiad</p>
        </div>

        {/* Divider */}
        <div style={dividerStyle} />

        <h2 style={headingStyle}>Admin Sign In</h2>
        <p style={descStyle}>Enter your credentials to access the admin panel.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@nao2026.in"
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = "#c0392b"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192,57,43,0.12)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = "#c0392b"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192,57,43,0.12)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {error && (
            <div style={errorStyle}>
              <span style={{ fontSize: 14 }}>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ ...submitBtnStyle, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={footerStyle}>NAO 2026 Admin Panel · Restricted Access</p>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "var(--bg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
};

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  borderRadius: 20,
  padding: "44px 40px 36px",
  width: "100%",
  maxWidth: 400,
  boxShadow: "var(--shadow-lg)",
  border: "1px solid var(--border)",
};

const titleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: "var(--red)",
  letterSpacing: "-0.01em",
  marginBottom: 2,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--muted)",
  letterSpacing: 0.3,
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: "var(--border)",
  margin: "24px 0",
};

const headingStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "var(--text)",
  marginBottom: 6,
  letterSpacing: "-0.02em",
};

const descStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--muted)",
  marginBottom: 24,
  lineHeight: 1.5,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text)",
  marginBottom: 7,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  fontSize: 14,
  background: "var(--bg)",
  color: "var(--text)",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box",
};

const errorStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "#fdecea",
  color: "var(--red)",
  padding: "10px 14px",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 500,
};

const submitBtnStyle: React.CSSProperties = {
  background: "var(--red)",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "14px",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  width: "100%",
  marginTop: 4,
  letterSpacing: "-0.01em",
  transition: "opacity 0.15s",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: 11,
  color: "var(--muted)",
  marginTop: 28,
};
