// DANGER: deletes ALL rows in public.responses. Use only before go-live.
// Run: node --env-file=.env.local scripts/db-reset.mjs
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });
try {
  const [{ n: before }] = await sql`select count(*)::int as n from public.responses`;
  await sql`truncate table public.responses`;
  const [{ n: after }] = await sql`select count(*)::int as n from public.responses`;
  console.log(`Deleted ${before} row(s). Table now has ${after} row(s).`);
} catch (e) {
  console.error("ERROR:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
