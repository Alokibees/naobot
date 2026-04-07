import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 40px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <img src="https://nao.asdc.org.in/images/nao-logo-new.png" alt="NAO 2026" style={{ height: 28, objectFit: "contain" }} />
        <span style={{ fontSize: 13, color: "var(--muted)" }}>National Automobile Olympiad</span>
      </nav>

      {/* Hero */}
      <section style={{
        textAlign: "center", padding: "100px 24px 80px",
        background: "linear-gradient(180deg, #fff 0%, var(--bg) 100%)",
      }}>
        <img src="https://nao.asdc.org.in/images/nao-logo-new.png" alt="NAO 2026" style={{ height: 80, marginBottom: 24, objectFit: "contain" }} />
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700,
          letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1.1,
          marginBottom: 16,
        }}>
          National Automobile<br />
          <span style={{ color: "var(--red)" }}>Olympiad 2026</span>
        </h1>
        <p style={{ fontSize: 19, color: "var(--muted)", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.6 }}>
          India's premier automobile engineering competition for the next generation of innovators.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#" style={{
            background: "var(--red)", color: "#fff",
            padding: "14px 28px", borderRadius: 980, fontSize: 15, fontWeight: 600,
            boxShadow: "0 4px 16px rgba(192,57,43,0.35)",
          }}>Register Now</a>
          <a href="#" style={{
            background: "var(--surface)", color: "var(--text)",
            padding: "14px 28px", borderRadius: 980, fontSize: 15, fontWeight: 600,
            border: "1px solid var(--border)",
          }}>Learn More</a>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        display: "flex", justifyContent: "center", gap: 2,
        flexWrap: "wrap", padding: "0 24px 80px",
      }}>
        {[
          { value: "March 15–17", label: "Event Dates" },
          { value: "New Delhi", label: "Bharat Mandapam" },
          { value: "₹1,00,000", label: "Prize Pool" },
          { value: "16–25 yrs", label: "Eligibility" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "var(--surface)", borderRadius: "var(--radius)",
            padding: "28px 36px", textAlign: "center", flex: "1 1 160px",
            maxWidth: 200, margin: 4,
            boxShadow: "var(--shadow)",
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--red)", marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </section>

      <ChatWidget />
    </main>
  );
}
