import { NextResponse } from "next/server";
import { getFAQAnalytics } from "@/lib/analytics";
import { getFAQs } from "@/lib/faqStore";

export async function GET() {
  const analytics = getFAQAnalytics();
  const faqs = await getFAQs();

  // Enrich topFaqs with actual FAQ text
  const enriched = analytics.topFaqs.map(f => {
    const faq = faqs.find(q => q.id === f.faqId);
    return { ...f, answer: faq?.answer?.slice(0, 80) + "…" ?? "—", keywords: faq?.keywords ?? [] };
  });

  return NextResponse.json({ ...analytics, topFaqs: enriched });
}
