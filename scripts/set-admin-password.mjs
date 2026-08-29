// Set or change the admin login password (stored in the DB, not in env).
// Usage: node --env-file=.env.local scripts/set-admin-password.mjs <username> <password>
// Example: node --env-file=.env.local scripts/set-admin-password.mjs admin "MyPass@123"
import postgres from "postgres";
import { createHash } from "node:crypto";

const user = (process.argv[2] || "admin").trim();
const pass = process.argv[3];

if (!pass) {
  console.error(
    'Usage: node --env-file=.env.local scripts/set-admin-password.mjs <username> "<password>"'
  );
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (put it in .env.local).");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });

// Must match lib/adminAuth.ts credHash(): sha256("user:pass:field-study-admin-v1")
const hash = createHash("sha256")
  .update(`${user}:${pass}:field-study-admin-v1`)
  .digest("hex");

try {
  await sql`
    create table if not exists public.admin_auth (
      id            int primary key default 1,
      username      text not null,
      password_hash text not null,
      updated_at    timestamptz not null default now(),
      constraint admin_auth_singleton check (id = 1)
    )
  `;
  await sql`
    insert into public.admin_auth (id, username, password_hash)
    values (1, ${user}, ${hash})
    on conflict (id) do update
      set username = excluded.username,
          password_hash = excluded.password_hash,
          updated_at = now()
  `;
  console.log(`✓ Admin login set. Username: "${user}". You can log in now.`);
} catch (e) {
  console.error("ERROR:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
