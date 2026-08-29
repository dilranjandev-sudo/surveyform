import { getSql } from "./db";

// DB-backed admin auth. The admin username + password hash live in the
// `admin_auth` table (single row), so NO admin env vars are needed — only
// DATABASE_URL. Set/change the password with scripts/set-admin-password.mjs.

export const ADMIN_COOKIE = "fs_admin";

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Hash of the credentials as stored in the DB.
export function credHash(user: string, pass: string): Promise<string> {
  return sha256Hex(`${user}:${pass}:field-study-admin-v1`);
}

// The session cookie value proves knowledge of the password (derived from its
// stored hash) without exposing it. Invalidates automatically when the
// password changes.
export function sessionTokenFor(passwordHash: string): Promise<string> {
  return sha256Hex(`${passwordHash}:session-v1`);
}

async function ensureTable(sql: NonNullable<ReturnType<typeof getSql>>) {
  await sql`
    create table if not exists public.admin_auth (
      id            int primary key default 1,
      username      text not null,
      password_hash text not null,
      updated_at    timestamptz not null default now(),
      constraint admin_auth_singleton check (id = 1)
    )
  `;
}

export async function getStoredAdmin(): Promise<
  { username: string; password_hash: string } | null
> {
  const sql = getSql();
  if (!sql) return null;
  try {
    await ensureTable(sql);
    const rows = (await sql`
      select username, password_hash from public.admin_auth where id = 1
    `) as unknown as { username: string; password_hash: string }[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
