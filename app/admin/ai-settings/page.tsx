"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

type Settings = {
  enabled: boolean;
  apiKey: string;
  apiKeySet: boolean;
  model: string;
  systemPrompt: string;
  maxTokens: number;
};

const MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"];

export default function AISettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState({ apiKey: "", model: "", systemPrompt: "", maxTokens: 300 });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ answer: string; source: string } | null>(null);
  const [testQ, setTestQ] = useState("");

  useEffect(() => {
    fetch("/api/admin/ai-settings").then(r => r.json()).then((d: Settings) => {
      setSettings(d);
      setForm({ apiKey: "", model: d.model, systemPrompt: d.systemPrompt, maxTokens: d.maxTokens });
    });
  }, []);

  function flash(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function toggleAI() {
    if (!settings) return;
    const updated = await fetch("/api/admin/ai-settings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !settings.enabled }),
    }).then(r => r.json());
    setSettings(updated);
    flash(`AI ${updated.enabled ? "enabled" : "disabled"}.`);
  }

  async function save() {
    setSaving(true);
    const payload: Record<string, unknown> = {
      model: form.model,
      systemPrompt: form.systemPrompt,
      maxTokens: Number(form.maxTokens),
    };
    if (form.apiKey.trim()) payload.apiKey = form.apiKey.trim();

    const updated = await fetch("/api/admin/ai-settings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(r => r.json());

    setSettings(updated);
    setForm(f => ({ ...f, apiKey: "" }));
    setSaving(false);
    flash("Settings saved.");
  }

  async function testBot() {
    if (!testQ.trim()) return;
    setTesting(true); setTestResult(null);
    const res = await fetch("/api/ask", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: testQ }),
    }).then(r => r.json());
    setTestResult(res);
    setTesting(false);
  }

  if (!settings) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 48px", color: "var(--muted)", fontSize: 14 }}>Loading…</main>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 48px", maxWidth: 760 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={pageTitle}>AI Settings</h1>
            <p style={pageSub}>Configure NaoBot's OpenAI integration</p>
          </div>
          {/* Enable / Disable toggle */}
          <button onClick={toggleAI} style={settings.enabled ? toggleOn : toggleOff}>
            <div style={toggleThumb(settings.enabled)} />
            <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 10 }}>
              {settings.enabled ? "AI Enabled" : "AI Disabled"}
            </span>
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ ...toastBase, background: toast.type === "success" ? "#d4edda" : "#fdecea", color: toast.type === "success" ? "#155724" : "var(--red)" }}>
            {toast.type === "success" ? "✓" : "⚠"} {toast.msg}
          </div>
        )}

        {/* Status banner */}
        <div style={{ ...statusBanner, background: settings.enabled ? "#f0fdf4" : "#fdecea", borderColor: settings.enabled ? "#86efac" : "#fca5a5" }}>
          <span style={{ fontSize: 18 }}>{settings.enabled ? "🟢" : "🔴"}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: settings.enabled ? "#166534" : "var(--red)" }}>
              AI is currently {settings.enabled ? "active" : "disabled"}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              {settings.enabled
                ? settings.apiKeySet ? "OpenAI key configured. NaoBot will use AI for unanswered questions." : "⚠ No API key set — AI calls will fail."
                : "NaoBot will only use FAQ responses. AI fallback is off."}
            </div>
          </div>
        </div>

        {/* API Key */}
        <div style={card}>
          <h2 style={cardTitle}>OpenAI API Key</h2>
          <p style={cardSub}>
            {settings.apiKeySet ? `Current key: ${settings.apiKey}` : "No API key configured."}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              type="password"
              placeholder="sk-... paste new key to update"
              value={form.apiKey}
              onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
            />
          </div>
        </div>

        {/* Model */}
        <div style={card}>
          <h2 style={cardTitle}>Model</h2>
          <p style={cardSub}>Choose which OpenAI model NaoBot uses.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            {MODELS.map(m => (
              <button key={m} onClick={() => setForm(f => ({ ...f, model: m }))}
                style={form.model === m ? modelActive : modelBtn}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* System Prompt */}
        <div style={card}>
          <h2 style={cardTitle}>System Prompt</h2>
          <p style={cardSub}>This is the instruction NaoBot receives before every conversation.</p>
          <textarea
            style={{ ...inputStyle, minHeight: 120, marginTop: 14, resize: "vertical" }}
            value={form.systemPrompt}
            onChange={e => setForm(f => ({ ...f, systemPrompt: e.target.value }))}
          />
        </div>

        {/* Max Tokens */}
        <div style={card}>
          <h2 style={cardTitle}>Max Response Length</h2>
          <p style={cardSub}>Maximum tokens per AI response (100–1000).</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
            <input type="range" min={100} max={1000} step={50}
              value={form.maxTokens}
              onChange={e => setForm(f => ({ ...f, maxTokens: Number(e.target.value) }))}
              style={{ flex: 1, accentColor: "var(--red)" }}
            />
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--red)", minWidth: 40 }}>{form.maxTokens}</span>
          </div>
        </div>

        <button onClick={save} disabled={saving} style={saveBtn}>
          {saving ? "Saving…" : "Save Settings"}
        </button>

        {/* Test NaoBot */}
        <div style={{ ...card, marginTop: 32 }}>
          <h2 style={cardTitle}>🧪 Test NaoBot</h2>
          <p style={cardSub}>Send a question and see exactly how NaoBot responds right now.</p>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="e.g. When is the event?"
              value={testQ}
              onChange={e => setTestQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && testBot()}
            />
            <button onClick={testBot} disabled={testing} style={testBtn}>
              {testing ? "…" : "Ask"}
            </button>
          </div>
          {testResult && (
            <div style={testResultBox}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>RESPONSE</span>
                <span style={testResult.source === "faq" ? faqBadge : aiBadge}>
                  via {testResult.source.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>{testResult.answer}</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

/* ── Styles ── */
const pageTitle: React.CSSProperties = { fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)" };
const pageSub: React.CSSProperties = { fontSize: 14, color: "var(--muted)", marginTop: 4 };

const toggleOn: React.CSSProperties = {
  display: "flex", alignItems: "center", background: "#dcfce7",
  border: "1px solid #86efac", borderRadius: 980, padding: "8px 16px 8px 8px",
  cursor: "pointer", color: "#166534",
};
const toggleOff: React.CSSProperties = {
  ...toggleOn, background: "#fdecea", border: "1px solid #fca5a5", color: "var(--red)",
};
const toggleThumb = (on: boolean): React.CSSProperties => ({
  width: 22, height: 22, borderRadius: "50%",
  background: on ? "#16a34a" : "var(--red)",
  flexShrink: 0,
});

const toastBase: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "12px 18px", borderRadius: 10, fontSize: 13, marginBottom: 20,
};

const statusBanner: React.CSSProperties = {
  display: "flex", alignItems: "flex-start", gap: 14,
  padding: "16px 20px", borderRadius: 14, border: "1px solid",
  marginBottom: 24,
};

const card: React.CSSProperties = {
  background: "#fff", borderRadius: 16, padding: "22px 24px",
  boxShadow: "var(--shadow)", border: "1px solid var(--border)", marginBottom: 16,
};
const cardTitle: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" };
const cardSub: React.CSSProperties = { fontSize: 13, color: "var(--muted)", marginTop: 4 };

const inputStyle: React.CSSProperties = {
  padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)",
  fontSize: 13, background: "#fafafa", outline: "none",
  boxSizing: "border-box" as const, width: "100%",
};

const modelBtn: React.CSSProperties = {
  padding: "8px 16px", borderRadius: 980, border: "1px solid var(--border)",
  background: "#fff", fontSize: 13, cursor: "pointer", color: "var(--muted)", fontWeight: 500,
};
const modelActive: React.CSSProperties = {
  ...modelBtn, background: "var(--red)", color: "#fff", border: "1px solid var(--red)", fontWeight: 700,
};

const saveBtn: React.CSSProperties = {
  background: "var(--red)", color: "#fff", border: "none",
  borderRadius: 12, padding: "13px 32px", fontWeight: 700,
  fontSize: 15, cursor: "pointer", boxShadow: "0 2px 12px rgba(192,57,43,0.3)",
};

const testBtn: React.CSSProperties = {
  background: "var(--red)", color: "#fff", border: "none",
  borderRadius: 10, padding: "10px 20px", fontWeight: 600,
  fontSize: 13, cursor: "pointer", flexShrink: 0,
};

const testResultBox: React.CSSProperties = {
  marginTop: 16, background: "var(--bg)", borderRadius: 12,
  padding: "16px 18px", border: "1px solid var(--border)",
};

const faqBadge: React.CSSProperties = { background: "var(--red-light)", color: "var(--red)", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 };
const aiBadge: React.CSSProperties = { background: "#eff6ff", color: "#3b82f6", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 };
