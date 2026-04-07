"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function EmbedPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const host = typeof window !== "undefined" ? window.location.origin : "https://your-nao-domain.com";

  const scriptTag = `<script src="${host}/naobot.js" async></script>`;

  const iframeCode = `<iframe
  src="${host}/widget?host=${encodeURIComponent(host)}"
  style="position:fixed;bottom:0;right:0;width:420px;height:620px;border:none;z-index:9999"
  allow="clipboard-write"
></iframe>`;

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2500);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "40px 48px", maxWidth: 800 }}>
        <h1 style={pageTitle}>Embed NaoBot</h1>
        <p style={pageSub}>Add NaoBot to any website with one line of code.</p>

        {/* Option 1 — Script tag */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <h2 style={cardTitle}>Option 1 — Script Tag <span style={recommended}>Recommended</span></h2>
              <p style={cardSub}>Paste this before the closing <code style={code}>&lt;/body&gt;</code> tag of your website.</p>
            </div>
            <button onClick={() => copy(scriptTag, "script")} style={copyBtn}>
              {copied === "script" ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <pre style={codeBlock}>{scriptTag}</pre>
        </div>

        {/* Option 2 — iframe */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <h2 style={cardTitle}>Option 2 — iframe Embed</h2>
              <p style={cardSub}>Use this if your site blocks external scripts.</p>
            </div>
            <button onClick={() => copy(iframeCode, "iframe")} style={copyBtn}>
              {copied === "iframe" ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <pre style={codeBlock}>{iframeCode}</pre>
        </div>

        {/* Instructions */}
        <div style={card}>
          <h2 style={cardTitle}>How it works</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
            {[
              { step: "1", title: "Copy the script tag above", desc: "Use Option 1 for most websites (WordPress, Webflow, plain HTML, etc.)" },
              { step: "2", title: "Paste before </body>", desc: "Add it to every page where you want NaoBot to appear, or in your global layout/footer." },
              { step: "3", title: "NaoBot loads automatically", desc: "The widget appears bottom-right. Users fill in their details, then chat with NaoBot." },
              { step: "4", title: "All data flows here", desc: "Registrations and chat logs are saved to this admin panel regardless of which site the user came from." },
            ].map(s => (
              <div key={s.step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={stepNum}>{s.step}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live preview link */}
        <div style={{ ...card, background: "#fdecea", border: "1px solid #fca5a5" }}>
          <h2 style={{ ...cardTitle, color: "var(--red)" }}>Test the widget</h2>
          <p style={{ ...cardSub, marginBottom: 14 }}>Open the standalone widget page to preview exactly what users will see.</p>
          <a href="/widget" target="_blank" style={previewBtn}>Open Widget Preview →</a>
        </div>
      </main>
    </div>
  );
}

const pageTitle: React.CSSProperties = { fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)" };
const pageSub: React.CSSProperties = { fontSize: 14, color: "var(--muted)", marginTop: 4 };
const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: "22px 24px", boxShadow: "var(--shadow)", border: "1px solid var(--border)", marginTop: 20 };
const cardTitle: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 };
const cardSub: React.CSSProperties = { fontSize: 13, color: "var(--muted)", marginTop: 4 };
const recommended: React.CSSProperties = { background: "#d4edda", color: "#155724", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6 };
const codeBlock: React.CSSProperties = { background: "#1a1a1f", color: "#e2e8f0", borderRadius: 10, padding: "14px 18px", fontSize: 13, fontFamily: "monospace", overflowX: "auto", marginTop: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all" };
const code: React.CSSProperties = { background: "var(--bg)", padding: "1px 6px", borderRadius: 4, fontSize: 12, fontFamily: "monospace" };
const copyBtn: React.CSSProperties = { background: "var(--red)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 };
const stepNum: React.CSSProperties = { width: 28, height: 28, borderRadius: "50%", background: "var(--red)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 };
const previewBtn: React.CSSProperties = { display: "inline-block", background: "var(--red)", color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none" };
