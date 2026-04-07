import { NextRequest, NextResponse } from "next/server";
import { getAISettings } from "@/lib/aiSettings";
import { recordFAQHit, recordAIHit } from "@/lib/analytics";
import { checkRateLimit } from "@/lib/rateLimit";

async function findFAQAnswer(question: string): Promise<{ answer: string; faqId: number; keyword: string } | null> {
  try {
    const { pool } = await import("@/lib/db");
    const words = question.toLowerCase().split(/\s+/).filter(Boolean);
    const result = await pool.query<{ id: number; answer: string; keywords: string[] }>(
      `SELECT id, answer, keywords FROM faqs WHERE keywords && $1 LIMIT 1`, [words]
    );
    if (result.rows[0]) {
      const row = result.rows[0];
      const matched = row.keywords.find(k => question.toLowerCase().includes(k)) ?? row.keywords[0];
      return { answer: row.answer, faqId: row.id, keyword: matched };
    }
  } catch { /* DB unavailable */ }

  const staticFaqs = [
    { id: 1, keywords: ["register", "registration", "sign up", "enroll"], answer: "Registration for NAO 2026 opens on January 1, 2026 at nao2026.in/register." },
    { id: 2, keywords: ["date", "when", "schedule", "event date"],         answer: "National Automobile Olympiad 2026 is scheduled for March 15–17, 2026." },
    { id: 3, keywords: ["venue", "location", "where", "city"],             answer: "NAO 2026 will be held at Bharat Mandapam, New Delhi." },
    { id: 4, keywords: ["eligibility", "who can", "age", "criteria"],      answer: "Open to students aged 16–25 enrolled in any recognized institution." },
    { id: 5, keywords: ["fee", "cost", "price", "payment"],                answer: "The participation fee is ₹500 per team. Payment is accepted online." },
    { id: 6, keywords: ["team", "members", "group", "size"],               answer: "Each team must have 3–5 members from the same institution." },
    { id: 7, keywords: ["prize", "award", "winner", "reward"],             answer: "Winners receive trophies, certificates, and cash prizes up to ₹1,00,000." },
    { id: 8, keywords: ["contact", "support", "help", "email"],            answer: "Contact us at support@nao2026.in or call +91-11-12345678." },
  ];
  const q = question.toLowerCase();
  for (const entry of staticFaqs) {
    const matched = entry.keywords.find(k => q.includes(k));
    if (matched) return { answer: entry.answer, faqId: entry.id, keyword: matched };
  }
  return null;
}

async function tryLogChat(question: string, answer: string, source: string) {
  try {
    const { pool } = await import("@/lib/db");
    await pool.query(
      `INSERT INTO chat_logs (question, answer, source) VALUES ($1, $2, $3)`,
      [question, answer, source]
    );
  } catch { /* DB not ready */ }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  const { question } = await req.json();
  if (!question?.trim())
    return NextResponse.json({ error: "Question is required" }, { status: 400 });

  // 1. FAQ first
  const faqResult = await findFAQAnswer(question);
  if (faqResult) {
    recordFAQHit(faqResult.faqId, faqResult.keyword, question);
    tryLogChat(question, faqResult.answer, "faq");
    return NextResponse.json({ answer: faqResult.answer, source: "faq" });
  }

  // 2. Check AI settings
  const settings = getAISettings();

  if (!settings.enabled) {
    const msg = "AI is currently disabled. Please ask about registration, dates, venue, eligibility, fees, teams, prizes, or contact info.";
    return NextResponse.json({ answer: msg, source: "faq" });
  }

  if (!settings.apiKey) {
    const msg = "AI is not configured yet. Please contact support@nao2026.in for help.";
    return NextResponse.json({ answer: msg, source: "faq" });
  }

  // 3. Call OpenAI
  recordAIHit(question);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: "system", content: settings.systemPrompt },
          { role: "user", content: question },
        ],
        max_tokens: settings.maxTokens,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
    const data = await res.json();
    const aiAnswer = data.choices[0].message.content;
    tryLogChat(question, aiAnswer, "ai");
    return NextResponse.json({ answer: aiAnswer, source: "ai" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ answer: "AI is temporarily unavailable. Please try again later.", source: "ai" });
  }
}
