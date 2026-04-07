// In-memory analytics store
export type FAQHit = { faqId: number; keyword: string; question: string; timestamp: Date };
export type AIHit  = { question: string; timestamp: Date };

const g = global as unknown as { faqHits: FAQHit[]; aiHits: AIHit[] };
if (!g.faqHits) g.faqHits = [];
if (!g.aiHits)  g.aiHits  = [];

export function recordFAQHit(faqId: number, keyword: string, question: string) {
  g.faqHits.push({ faqId, keyword, question, timestamp: new Date() });
  if (g.faqHits.length > 2000) g.faqHits.shift(); // cap memory
}

export function recordAIHit(question: string) {
  g.aiHits.push({ question, timestamp: new Date() });
  if (g.aiHits.length > 2000) g.aiHits.shift();
}

export function getFAQAnalytics() {
  // Top FAQ entries by hit count
  const counts: Record<number, { faqId: number; keyword: string; count: number }> = {};
  for (const h of g.faqHits) {
    if (!counts[h.faqId]) counts[h.faqId] = { faqId: h.faqId, keyword: h.keyword, count: 0 };
    counts[h.faqId].count++;
  }
  const topFaqs = Object.values(counts).sort((a, b) => b.count - a.count);

  // Hourly distribution (last 24h)
  const hourly = Array(24).fill(0);
  const now = Date.now();
  for (const h of g.faqHits) {
    const diff = now - h.timestamp.getTime();
    if (diff < 86400000) hourly[h.timestamp.getHours()]++;
  }

  return { topFaqs, hourly, totalFAQHits: g.faqHits.length, totalAIHits: g.aiHits.length };
}

export function getUnansweredQuestions() {
  // Deduplicate AI hits by similar questions
  const seen = new Set<string>();
  return g.aiHits
    .filter(h => { const k = h.question.toLowerCase().trim(); if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 100);
}
