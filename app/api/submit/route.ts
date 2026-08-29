import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSql } from "@/lib/db";

// Runs on the Node.js runtime (needs the Postgres client and, for the dev
// fallback, fs).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { submittedAt?: string; answers?: unknown };
  const submittedAt = payload.submittedAt ?? new Date().toISOString();
  const answers = payload.answers ?? [];

  // 1) Preferred: persist to Supabase Postgres (production).
  const sql = getSql();
  if (sql) {
    try {
      await sql`
        insert into public.responses (submitted_at, answers)
        values (${submittedAt}, ${sql.json(answers as Parameters<typeof sql.json>[0])})
      `;
      return NextResponse.json({ ok: true, stored: "supabase" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "DB insert failed";
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
  }

  // 2) Fallback: append to a local file so local dev works without a database.
  try {
    const dir = path.join(process.cwd(), "data");
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(
      path.join(dir, "responses.ndjson"),
      JSON.stringify({ submitted_at: submittedAt, answers }) + "\n",
      "utf8"
    );
    return NextResponse.json({ ok: true, stored: "file" });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No storage configured (set DATABASE_URL)" },
      { status: 500 }
    );
  }
}
