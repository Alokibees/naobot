"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
  source?: "faq" | "ai";
};

type Props = {
  user: { name: string; email: string; phone: string };
};

export default function ChatBox({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: `Hi ${user.name}! 👋 How can I help you with NAO 2026?` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer, source: data.source }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, fontFamily: "sans-serif" }}>
      {/* Chat window */}
      {open && (
        <div style={window}>
          {/* Header */}
          <div style={header}>
            <span>🏎️ NAO 2026 Support</span>
            <button onClick={() => setOpen(false)} style={closeBtn}>✕</button>
          </div>

          {/* Messages */}
          <div style={msgArea}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
                <div style={msg.role === "user" ? userBubble : botBubble}>
                  <div>{msg.text}</div>
                  {msg.source && (
                    <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3 }}>
                      via {msg.source === "faq" ? "FAQ" : "AI"}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
                <div style={botBubble}>Typing...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={inputRow}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={sendBtn}>➤</button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setOpen((o) => !o)} style={fab}>
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}

const window: React.CSSProperties = {
  width: 340, height: 460,
  background: "#fff", borderRadius: 16,
  boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
  display: "flex", flexDirection: "column",
  marginBottom: 12, overflow: "hidden",
};

const header: React.CSSProperties = {
  background: "#0f3460", color: "#fff",
  padding: "12px 16px", fontWeight: 600, fontSize: 14,
  display: "flex", justifyContent: "space-between", alignItems: "center",
};

const closeBtn: React.CSSProperties = {
  background: "none", border: "none", color: "#fff",
  fontSize: 16, cursor: "pointer", lineHeight: 1,
};

const msgArea: React.CSSProperties = {
  flex: 1, overflowY: "auto", padding: "12px 12px 4px",
};

const userBubble: React.CSSProperties = {
  background: "#0f3460", color: "#fff",
  padding: "8px 12px", borderRadius: "16px 16px 4px 16px",
  maxWidth: "80%", fontSize: 13,
};

const botBubble: React.CSSProperties = {
  background: "#f1f1f1", color: "#222",
  padding: "8px 12px", borderRadius: "16px 16px 16px 4px",
  maxWidth: "80%", fontSize: 13,
};

const inputRow: React.CSSProperties = {
  display: "flex", gap: 6, padding: "10px 12px",
  borderTop: "1px solid #eee",
};

const inputStyle: React.CSSProperties = {
  flex: 1, padding: "8px 12px", borderRadius: 20,
  border: "1px solid #ddd", fontSize: 13, outline: "none",
};

const sendBtn: React.CSSProperties = {
  background: "#0f3460", color: "#fff", border: "none",
  borderRadius: "50%", width: 36, height: 36,
  cursor: "pointer", fontSize: 14,
};

const fab: React.CSSProperties = {
  width: 52, height: 52, borderRadius: "50%",
  background: "#0f3460", color: "#fff", border: "none",
  fontSize: 22, cursor: "pointer", display: "block",
  marginLeft: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
};
