import { cookies } from "next/headers";
import { getSql } from "../../../../lib/db";
import { questions } from "../../../../lib/questions";
import { ADMIN_COOKIE, getStoredAdmin, sessionTokenFor } from "../../../../lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ans = { id: number; answer: unknown };
type Row = { created_at: string; submitted_at: string | null; answers: Ans[] };

function esc(v: unknown): string {
  let s: string;
  if (v == null) s = "";
  else if (v instanceof Date) s = v.toISOString();
  else if (Array.isArray(v)) s = v.join("; ");
  else s = String(v);
  return '"' + s.replace(/"/g, '""') + '"';
}

export async function GET() {
  // Auth: cookie must match the current password hash in the DB.
  const admin = await getStoredAdmin();
  if (!admin) return new Response("Unauthorized", { status: 401 });
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || token !== (await sessionTokenFor(admin.password_hash))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sql = getSql();
  if (!sql) {
    return new Response("DATABASE_URL not set", { status: 503 });
  }

  let rows: Row[];
  try {
    rows = (await sql`
      select created_at, submitted_at, answers
      from public.responses
      order by created_at desc
    `) as unknown as Row[];
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Query failed";
    return new Response("Error: " + msg, { status: 500 });
  }

  const header = ["submitted_at", ...questions.map((q) => `Q${q.id}: ${q.title}`)];
  const lines = [header.map(esc).join(",")];

  for (const r of rows) {
    const map = new Map((r.answers ?? []).map((a) => [a.id, a.answer]));
    const cells = [
      r.submitted_at ?? r.created_at,
      ...questions.map((q) => map.get(q.id)),
    ];
    lines.push(cells.map(esc).join(","));
  }

  const csv = "﻿" + lines.join("\r\n"); // BOM for Excel

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="survey-responses.csv"',
    },
  });
}
