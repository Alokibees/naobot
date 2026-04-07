import { NextResponse } from "next/server";
import { getUnansweredQuestions } from "@/lib/analytics";

export async function GET() {
  return NextResponse.json(getUnansweredQuestions());
}
