import { NextResponse } from "next/server";
import { getFAQs } from "@/lib/faqStore";

// In-memory counters (replaced by DB queries when available)
const globalStore = global as unknown as {
  chatLogs: { question: string; source: string; createdAt: Date }[];
  users: { name: string; email: string; createdAt: Date }[];
};
if (!globalStore.chatLogs) globalStore.chatLogs = [];
if (!globalStore.users) globalStore.users = [];

export async function GET() {
  try {
    // Try DB
    const { pool } = await import("@/lib/db");
    await pool.query("SELECT 1");

    const [usersRes, chatsRes, faqHitsRes, todayUsersRes, todayChatsRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM chat_logs"),
      pool.query("SELECT COUNT(*) FROM chat_logs WHERE source='faq'"),
      pool.query("SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '1 day'"),
      pool.query("SELECT COUNT(*) FROM chat_logs WHERE created_at >= NOW() - INTERVAL '1 day'"),
    ]);

    const totalChats = parseInt(chatsRes.rows[0].count);
    const faqHits = parseInt(faqHitsRes.rows[0].count);

    return NextResponse.json({
      totalUsers: parseInt(usersRes.rows[0].count),
      totalChats,
      faqHits,
      aiHits: totalChats - faqHits,
      faqRate: totalChats > 0 ? Math.round((faqHits / totalChats) * 100) : 0,
      todayUsers: parseInt(todayUsersRes.rows[0].count),
      todayChats: parseInt(todayChatsRes.rows[0].count),
      totalFaqs: (await getFAQs()).length,
    });
  } catch {
    // Fallback: in-memory
    const faqs = await getFAQs();
    const logs = globalStore.chatLogs;
    const faqHits = logs.filter(l => l.source === "faq").length;
    const today = new Date(); today.setHours(0, 0, 0, 0);

    return NextResponse.json({
      totalUsers: globalStore.users.length,
      totalChats: logs.length,
      faqHits,
      aiHits: logs.length - faqHits,
      faqRate: logs.length > 0 ? Math.round((faqHits / logs.length) * 100) : 0,
      todayUsers: globalStore.users.filter(u => u.createdAt >= today).length,
      todayChats: logs.filter(l => l.createdAt >= today).length,
      totalFaqs: faqs.length,
    });
  }
}
