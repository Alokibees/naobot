import { pool } from "@/lib/db";

/**
 * Queries the faqs table using PostgreSQL's array overlap operator.
 * Falls back to null if no match found.
 */
export async function findFAQAnswer(question: string): Promise<string | null> {
  const words = question.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  const result = await pool.query<{ answer: string }>(
    `SELECT answer FROM faqs WHERE keywords && $1 LIMIT 1`,
    [words]
  );

  return result.rows[0]?.answer ?? null;
}
