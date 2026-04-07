export type FAQEntry = { id: number; keywords: string[]; answer: string };

// In-memory seed (used when DB is unavailable)
let memStore: FAQEntry[] = [
  { id: 1, keywords: ["register", "registration", "sign up", "enroll"], answer: "Registration for NAO 2026 opens on January 1, 2026 at nao2026.in/register." },
  { id: 2, keywords: ["date", "when", "schedule", "event date"],         answer: "National Automobile Olympiad 2026 is scheduled for March 15–17, 2026." },
  { id: 3, keywords: ["venue", "location", "where", "city"],             answer: "NAO 2026 will be held at Bharat Mandapam, New Delhi." },
  { id: 4, keywords: ["eligibility", "who can", "age", "criteria"],      answer: "Open to students aged 16–25 enrolled in any recognized institution." },
  { id: 5, keywords: ["fee", "cost", "price", "payment"],                answer: "The participation fee is ₹500 per team. Payment is accepted online." },
  { id: 6, keywords: ["team", "members", "group", "size"],               answer: "Each team must have 3–5 members from the same institution." },
  { id: 7, keywords: ["prize", "award", "winner", "reward"],             answer: "Winners receive trophies, certificates, and cash prizes up to ₹1,00,000." },
  { id: 8, keywords: ["contact", "support", "help", "email"],            answer: "Contact us at support@nao2026.in or call +91-11-12345678." },
];
let nextId = 9;

async function useDB(): Promise<boolean> {
  try {
    const { pool } = await import("./db");
    await pool.query("SELECT 1");
    return true;
  } catch { return false; }
}

export async function getFAQs(): Promise<FAQEntry[]> {
  if (await useDB()) {
    const { pool } = await import("./db");
    const r = await pool.query<FAQEntry>("SELECT id, keywords, answer FROM faqs ORDER BY id");
    return r.rows;
  }
  return memStore;
}

export async function addFAQ(keywords: string[], answer: string): Promise<FAQEntry> {
  if (await useDB()) {
    const { pool } = await import("./db");
    const r = await pool.query<FAQEntry>(
      "INSERT INTO faqs (keywords, answer) VALUES ($1, $2) RETURNING id, keywords, answer",
      [keywords, answer]
    );
    return r.rows[0];
  }
  const entry: FAQEntry = { id: nextId++, keywords, answer };
  memStore.push(entry);
  return entry;
}

export async function updateFAQ(id: number, keywords: string[], answer: string): Promise<FAQEntry> {
  if (await useDB()) {
    const { pool } = await import("./db");
    const r = await pool.query<FAQEntry>(
      "UPDATE faqs SET keywords=$1, answer=$2 WHERE id=$3 RETURNING id, keywords, answer",
      [keywords, answer, id]
    );
    return r.rows[0];
  }
  memStore = memStore.map((f) => (f.id === id ? { id, keywords, answer } : f));
  return { id, keywords, answer };
}

export async function deleteFAQ(id: number): Promise<void> {
  if (await useDB()) {
    const { pool } = await import("./db");
    await pool.query("DELETE FROM faqs WHERE id=$1", [id]);
    return;
  }
  memStore = memStore.filter((f) => f.id !== id);
}
