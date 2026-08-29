// Verify recent rows, then remove the test rows created during setup.
// Run: node --env-file=.env.local scripts/db-verify-clean.mjs
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });

try {
  const before = await sql`select count(*)::int as n from public.responses`;
  console.log("Rows before cleanup:", before[0].n);

  const latest = await sql`
    select id, created_at, answers
    from public.responses order by created_at desc limit 5`;
  console.log("Latest rows:");
  console.log(JSON.stringify(latest, null, 2));

  const deleted = await sql`
    delete from public.responses
    where answers::text like '%__APP_ROUTE_TEST__%'
       or answers::text like '%__connection_test__%'
    returning id`;
  console.log(`\nDeleted ${deleted.length} test row(s).`);

  const after = await sql`select count(*)::int as n from public.responses`;
  console.log("Rows after cleanup:", after[0].n, "(should be 0 for a fresh table)");
} catch (e) {
  console.error("ERROR:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
