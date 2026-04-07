"use client";

import { useState } from "react";

type Props = {
  onSuccess: (user: { name: string; email: string; phone: string }) => void;
};

export default function UserForm({ onSuccess }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      onSuccess(form);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={logo}>🏎️</div>
        <h2 style={title}>National Automobile Olympiad 2026</h2>
        <p style={subtitle}>Please enter your details to start chatting with our support bot.</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            style={input}
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            style={input}
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={input}
            type="tel"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          {error && <p style={{ color: "#e53e3e", fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={btn}>
            {loading ? "Please wait..." : "Start Chat →"}
          </button>
        </form>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0,
  background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontFamily: "sans-serif", zIndex: 100,
};

const card: React.CSSProperties = {
  background: "#fff", borderRadius: 16, padding: "2rem",
  width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
};

const logo: React.CSSProperties = {
  fontSize: 40, textAlign: "center", marginBottom: 8,
};

const title: React.CSSProperties = {
  textAlign: "center", fontSize: 18, fontWeight: 700,
  color: "#1a1a2e", margin: "0 0 6px",
};

const subtitle: React.CSSProperties = {
  textAlign: "center", fontSize: 13, color: "#666",
  margin: "0 0 20px",
};

const input: React.CSSProperties = {
  padding: "10px 14px", borderRadius: 8,
  border: "1px solid #ddd", fontSize: 14, outline: "none",
};

const btn: React.CSSProperties = {
  padding: "12px", background: "#0f3460", color: "#fff",
  border: "none", borderRadius: 8, fontSize: 15,
  fontWeight: 600, cursor: "pointer", marginTop: 4,
};
