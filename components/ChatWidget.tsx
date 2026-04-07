"use client";

import { useState, useRef, useEffect } from "react";

type User = { name: string; email: string; phone: string };
type Message = { role: "user" | "assistant"; text: string; source?: "faq" | "ai" };

const SUGGESTIONS = ["When is the event?", "How do I register?", "What are the prizes?", "Where is the venue?"];
const MAX_CHARS = 300;
const TIMEOUT_MS = 15000;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 999 }}>
      {open && (
        <div style={popup}>
          <div style={header}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={avatarWrap}>
                <img src="https://nao.asdc.org.in/images/nao-logo-new.png" alt="NaoBot" style={{ width: 22, height: 22, objectFit: "contain" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>NaoBot</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 1 }}>NAO 2026 · Online</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={closeBtn} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {!user ? <RegisterForm onSuccess={setUser} /> : <ChatPane user={user} />}
          </div>
        </div>
      )}

      <button onClick={() => setOpen(o => !o)} style={fab} aria-label="Chat with NaoBot">
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 3l14 14M17 3L3 17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <img src="https://nao.asdc.org.in/images/nao-logo-new.png" alt="NaoBot" style={{ width: 32, height: 32, objectFit: "contain" }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: "#fff" }}>NaoBot</span>
          </div>
        )}
      </button>
    </div>
  );
}

/* ── Register Form ── */
function RegisterForm({ onSuccess }: { onSuccess: (u: User) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      onSuccess(form);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column" }}>
      <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", marginBottom: 18, lineHeight: 1.5 }}>
        Tell us a bit about yourself to get started.
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(["name", "email", "phone"] as const).map(field => (
          <input key={field} style={formInput}
            type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
            placeholder={field === "name" ? "Full Name" : field === "email" ? "Email Address" : "Phone Number"}
            value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required />
        ))}
        {error && <p style={{ color: "var(--red)", fontSize: 12, margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading} style={submitBtn}>
          {loading ? "Please wait…" : "Start Chatting →"}
        </button>
      </form>
    </div>
  );
}

/* ── Chat Pane ── */
function ChatPane({ user }: { user: User }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: `Hi ${user.name} 👋 I'm NaoBot. Ask me anything about NAO 2026.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const showSuggestions = messages.length === 1 && !loading;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ask(q: string) {
    if (!q.trim() || loading) return;
    setInput("");
    setMessages(p => [...p, { role: "user", text: q }]);
    setLoading(true);

    const timer = setTimeout(() => {
      setMessages(p => [...p, { role: "assistant", text: "Sorry, that took too long. Please try again." }]);
      setLoading(false);
    }, TIMEOUT_MS);

    try {
      const res = await fetch("/api/ask", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      clearTimeout(timer);
      const data = await res.json();
      setMessages(p => [...p, { role: "assistant", text: data.answer, source: data.source }]);
    } catch {
      clearTimeout(timer);
      setMessages(p => [...p, { role: "assistant", text: "Something went wrong. Please try again." }]);
    } finally { setLoading(false); }
  }

  return (
    <>
      <div style={msgArea}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            {m.role === "assistant" && <div style={botIcon}><img src="https://nao.asdc.org.in/images/nao-logo-new.png" alt="" style={{ width: 16, height: 16, objectFit: "contain" }} /></div>}
            <div style={m.role === "user" ? userBubble : botBubble}>
              {m.text}
            </div>
          </div>
        ))}

        {showSuggestions && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => ask(s)} style={suggBtn}>{s}</button>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={botIcon}><img src="https://nao.asdc.org.in/images/nao-logo-new.png" alt="" style={{ width: 16, height: 16, objectFit: "contain" }} /></div>
            <div style={{ ...botBubble, display: "flex", gap: 4, alignItems: "center" }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#bbb", animation: `bounce 1.2s ${i*0.2}s infinite`, display: "inline-block" }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={e => { e.preventDefault(); ask(input); }} style={inputRow}>
        <div style={{ flex: 1, position: "relative" }}>
          <input value={input} onChange={e => setInput(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Ask NaoBot…" style={chatInput} />
          {input.length > MAX_CHARS * 0.8 && (
            <span style={{ position: "absolute", right: 8, bottom: -16, fontSize: 10, color: input.length >= MAX_CHARS ? "var(--red)" : "var(--muted)" }}>
              {input.length}/{MAX_CHARS}
            </span>
          )}
        </div>
        <button type="submit" disabled={loading || !input.trim()}
          style={{ ...sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }} aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 8L2 2l3 6-3 6 12-6z" fill="#fff"/>
          </svg>
        </button>
      </form>

      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }`}</style>
    </>
  );
}

/* ── Styles ── */
const popup: React.CSSProperties = { width: 340, height: 520, background: "#fff", borderRadius: 20, boxShadow: "0 24px 60px rgba(0,0,0,0.18),0 0 0 1px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", marginBottom: 16, overflow: "hidden" };
const header: React.CSSProperties = { background: "var(--red)", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, color: "#fff" };
const avatarWrap: React.CSSProperties = { width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 };
const closeBtn: React.CSSProperties = { background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
const fab: React.CSSProperties = { width: 64, height: 64, borderRadius: "50%", background: "var(--red)", border: "none", color: "#fff", cursor: "pointer", boxShadow: "0 4px 20px rgba(192,57,43,0.45)", display: "flex", alignItems: "center", justifyContent: "center" };
const formInput: React.CSSProperties = { padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 14, outline: "none", background: "#fafafa" };
const submitBtn: React.CSSProperties = { marginTop: 4, padding: "12px", background: "var(--red)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" };
const msgArea: React.CSSProperties = { flex: 1, overflowY: "auto", padding: "16px 14px 8px" };
const botIcon: React.CSSProperties = { width: 28, height: 28, borderRadius: "50%", background: "var(--red-light)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 6, alignSelf: "flex-end" };
const userBubble: React.CSSProperties = { background: "var(--red)", color: "#fff", padding: "10px 14px", borderRadius: "18px 18px 4px 18px", maxWidth: "75%", fontSize: 13, lineHeight: 1.5 };
const botBubble: React.CSSProperties = { background: "#f2f2f7", color: "var(--text)", padding: "10px 14px", borderRadius: "18px 18px 18px 4px", maxWidth: "75%", fontSize: 13, lineHeight: 1.5 };
const suggBtn: React.CSSProperties = { background: "#fff", border: "1px solid var(--border)", borderRadius: 980, padding: "7px 14px", fontSize: 12, color: "var(--text)", cursor: "pointer", textAlign: "left", fontWeight: 500 };
const inputRow: React.CSSProperties = { display: "flex", gap: 8, padding: "10px 12px", borderTop: "1px solid var(--border)", flexShrink: 0, background: "#fff" };
const chatInput: React.CSSProperties = { width: "100%", padding: "9px 14px", borderRadius: 980, border: "1px solid var(--border)", fontSize: 13, outline: "none", background: "#f2f2f7", boxSizing: "border-box" as const };
const sendBtn: React.CSSProperties = { width: 36, height: 36, borderRadius: "50%", background: "var(--red)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 };
