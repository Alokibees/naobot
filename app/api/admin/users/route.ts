import { NextResponse } from "next/server";

const globalStore = global as unknown as { users: { id: number; name: string; email: string; phone: string; created_at: string }[] };
if (!globalStore.users) globalStore.users = [];

export async function GET() {
  try {
    const { pool } = await import("@/lib/db");
    await pool.query("SELECT 1");
    const r = await pool.query("SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC");
    return NextResponse.json(r.rows);
  } catch {
    return NextResponse.json(globalStore.users);
  }
}
