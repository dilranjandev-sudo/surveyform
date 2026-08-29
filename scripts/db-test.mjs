// Connectivity + save test for the Supabase Postgres database.
// Run with:  node --env-file=.env.local scripts/db-test.mjs
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL (put it in .env.local)");
  process.exit(1);
}

const sql = postgres(url, {
  ssl: "require",
  max: 1,
  connect_timeout: 15,
  idle_timeout: 5,
});

try {
  console.log("Connecting…");

  await sql`
    create table if not exists public.responses (
      id            uuid primary key default gen_random_uuid(),
      created_at    timestamptz not null default now(),
      submitted_at  timestamptz,
      answers       jsonb not null
    )
  `;
  console.log("✓ Table 'responses' is ready");

  const testAnswers = [
    { id: 0, question: "__connection_test__", answer: "hello from db-test" },
  ];
  const inserted = await sql`
    insert into public.responses (submitted_at, answers)
    values (${new Date().toISOString()}, ${sql.json(testAnswers)})
    returning id, created_at
  `;
  console.log("✓ Inserted test row:", inserted[0]);

  const [{ n }] = await sql`select count(*)::int as n from public.responses`;
  console.log(`✓ Table now has ${n} row(s)`);

  const latest = await sql`
    select id, created_at, answers
    from public.responses
    order by created_at desc
    limit 3
  `;
  console.log("✓ Latest rows:");
  console.log(JSON.stringify(latest, null, 2));

  console.log("\nSUCCESS — saving to Supabase works.");
} catch (e) {
  console.error("\nDB ERROR:", e.message);
  if (e.code) console.error("code:", e.code);
  process.exitCode = 1;
} finally {
  await sql.end();
}
