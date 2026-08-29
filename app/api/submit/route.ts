import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase";

// Runs on the Node.js runtime (needs fs for the local-dev fallback and the
// service-role Supabase client).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as {
    submittedAt?: string;
    answers?: unknown;
  };

  const record = {
    submitted_at: payload.submittedAt ?? new Date().toISOString(),
    answers: payload.answers ?? null,
  };

  // 1) Preferred: persist to Supabase (production).
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("responses").insert(record);
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, stored: "supabase" });
  }

  // 2) Fallback: append to a local file so local dev works without Supabase.
  //    (This branch is skipped on read-only/serverless hosts.)
  try {
    const dir = path.join(process.cwd(), "data");
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(
      path.join(dir, "responses.ndjson"),
      JSON.stringify({ ...record, receivedAt: new Date().toISOString() }) + "\n",
      "utf8"
    );
    return NextResponse.json({ ok: true, stored: "file" });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "No storage configured (set Supabase env vars)" },
      { status: 500 }
    );
  }
}
