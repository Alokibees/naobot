import { Pool } from "pg";

// Reuse pool across hot reloads in dev
const globalForPg = global as unknown as { pgPool: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;
