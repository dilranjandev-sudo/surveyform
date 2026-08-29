import postgres from "postgres";

/**
 * Server-only Postgres client (Supabase). Reused across requests via a
 * global singleton so a long-running Node server doesn't open a new pool
 * per request (and survives HMR in dev). Returns null when DATABASE_URL
 * isn't set, so the API route can fall back to a local file in dev.
 */
type Sql = ReturnType<typeof postgres>;
const g = globalThis as unknown as { __sql?: Sql | null };

export function getSql(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!g.__sql) {
    g.__sql = postgres(url, {
      ssl: "require",
      max: 3,
      idle_timeout: 20,
      connect_timeout: 15,
    });
  }
  return g.__sql;
}
