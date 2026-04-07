import { Pool } from "pg";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });


const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       TEXT        NOT NULL,
        email      TEXT        NOT NULL UNIQUE,
        phone      TEXT        NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS faqs (
        id        SERIAL PRIMARY KEY,
        keywords  TEXT[]       NOT NULL,
        answer    TEXT         NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS chat_logs (
        id         SERIAL PRIMARY KEY,
        question   TEXT        NOT NULL,
        answer     TEXT        NOT NULL,
        source     VARCHAR(10) NOT NULL CHECK (source IN ('faq', 'ai')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Seed FAQ data for National Automobile Olympiad 2026
    await client.query(`
      INSERT INTO faqs (keywords, answer) VALUES
        (ARRAY['register','registration','sign up','enroll'],   'Registration for NAO 2026 opens on January 1, 2026 at nao2026.in/register.'),
        (ARRAY['date','when','schedule','event date'],          'National Automobile Olympiad 2026 is scheduled for March 15–17, 2026.'),
        (ARRAY['venue','location','where','city'],              'NAO 2026 will be held at Bharat Mandapam, New Delhi.'),
        (ARRAY['eligibility','who can','age','criteria'],       'Open to students aged 16–25 enrolled in any recognized institution.'),
        (ARRAY['fee','cost','price','payment'],                 'The participation fee is ₹500 per team. Payment is accepted online.'),
        (ARRAY['team','members','group','size'],                'Each team must have 3–5 members from the same institution.'),
        (ARRAY['prize','award','winner','reward'],              'Winners receive trophies, certificates, and cash prizes up to ₹1,00,000.'),
        (ARRAY['contact','support','help','email'],             'Contact us at support@nao2026.in or call +91-11-12345678.')
      ON CONFLICT DO NOTHING;
    `);

    console.log("Migration complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
