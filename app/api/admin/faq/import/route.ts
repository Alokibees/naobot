import { NextRequest, NextResponse } from "next/server";
import { addFAQ } from "@/lib/faqStore";

export async function POST(req: NextRequest) {
  const text = await req.text();
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Skip header row if present
  const dataLines = lines[0].toLowerCase().includes("keyword") ? lines.slice(1) : lines;

  const results = { added: 0, failed: 0, errors: [] as string[] };

  for (const line of dataLines) {
    // CSV format: "keyword1|keyword2|keyword3","Answer text"
    const match = line.match(/^"?([^"]+)"?,\s*"?([^"]+)"?$/);
    if (!match) { results.failed++; results.errors.push(`Bad format: ${line.slice(0, 50)}`); continue; }

    const keywords = match[1].split("|").map(k => k.trim()).filter(Boolean);
    const answer = match[2].trim();

    if (!keywords.length || !answer) { results.failed++; continue; }

    await addFAQ(keywords, answer);
    results.added++;
  }

  return NextResponse.json(results);
}
