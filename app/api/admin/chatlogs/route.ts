import { NextResponse } from "next/server";

const globalStore = global as unknown as { chatLogs: { id: number; question: string; answer: string; source: string; created_at: string }[] };
if (!globalStore.chatLogs) globalStore.chatLogs = [];

export async function GET() {
  try {
    const { pool } = await import("@/lib/db");
    await pool.query("SELECT 1");
    const r = await pool.query("SELECT id, question, answer, source, created_at FROM chat_logs ORDER BY created_at DESC LIMIT 200");
    return NextResponse.json(r.rows);
  } catch {
    return NextResponse.json([...globalStore.chatLogs].reverse());
  }
}
