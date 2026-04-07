import { NextRequest, NextResponse } from "next/server";

// In-memory store (swaps to DB when available)
import { getFAQs, addFAQ, updateFAQ, deleteFAQ } from "@/lib/faqStore";

export async function GET() {
  const faqs = await getFAQs();
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  const { keywords, answer } = await req.json();
  if (!keywords?.length || !answer?.trim())
    return NextResponse.json({ error: "Keywords and answer are required" }, { status: 400 });
  const entry = await addFAQ(keywords, answer.trim());
  return NextResponse.json(entry, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { id, keywords, answer } = await req.json();
  if (!id || !keywords?.length || !answer?.trim())
    return NextResponse.json({ error: "id, keywords and answer are required" }, { status: 400 });
  const entry = await updateFAQ(id, keywords, answer.trim());
  return NextResponse.json(entry);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await deleteFAQ(id);
  return NextResponse.json({ success: true });
}
