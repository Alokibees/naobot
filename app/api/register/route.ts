import { NextRequest, NextResponse } from "next/server";

// Try DB save but never block the user if it fails
async function tryDBSave(name: string, email: string, phone: string) {
  try {
    const { pool } = await import("@/lib/db");
    await pool.query(
      `INSERT INTO users (name, email, phone)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET name = $1, phone = $3`,
      [name, email.toLowerCase(), phone]
    );
  } catch {
    // DB not ready — silently skip, user still gets through
  }
}

export async function POST(req: NextRequest) {
  const { name, email, phone } = await req.json();

  if (!name?.trim() || !email?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Fire-and-forget DB save
  tryDBSave(name.trim(), email.trim(), phone.trim());

  return NextResponse.json({ success: true });
}
