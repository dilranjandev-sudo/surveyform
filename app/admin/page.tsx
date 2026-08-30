import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSql } from "../../lib/db";
import { ADMIN_COOKIE, getStoredAdmin, sessionTokenFor } from "../../lib/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireAuth() {
  const admin = await getStoredAdmin();
  if (!admin) redirect("/admin/login");
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const expected = await sessionTokenFor(admin.password_hash);
  if (!token || token !== expected) redirect("/admin/login");
}

type Ans = { id: string; question?: string; answer: unknown };
type Row = {
  id: string;
  created_at: string;
  submitted_at: string | null;
  answers: Ans[];
};

function fmtDate(d: string) {
  return new Date(d).toISOString().slice(0, 16).replace("T", " ") + " UTC";
}
function fmtAnswer(v: unknown) {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}
function snippet(r: Row) {
  const first = r.answers?.find((a) => fmtAnswer(a.answer) !== "—");
  const s = first ? fmtAnswer(first.answer) : "";
  return s.length > 60 ? s.slice(0, 60) + "…" : s;
}

export default async function AdminPage() {
  await requireAuth();

  const sql = getSql();
  let rows: Row[] = [];
  let error: string | null = null;

  if (!sql) {
    error = "DATABASE_URL is not set — no database connected.";
  } else {
    try {
      rows = (await sql`
        select id, created_at, submitted_at, answers
        from public.responses
        order by created_at desc
        limit 1000
      `) as unknown as Row[];
    } catch (e) {
      error = e instanceof Error ? e.message : "Query failed";
    }
  }

  return (
    <div className="admin">
      <header className="admin__head">
        <div>
          <div className="admin__brand">
            Field <b>Study</b> <span>· Responses</span>
          </div>
          <div className="admin__count">
            {error ? "—" : `${rows.length} response${rows.length === 1 ? "" : "s"}`}
          </div>
        </div>
        <div className="admin__actions">
          <a className="abtn" href="/admin">Refresh</a>
          <a className="abtn abtn--primary" href="/api/admin/export">Export CSV</a>
          <a className="abtn" href="/api/admin/logout">Log out</a>
        </div>
      </header>

      {error && <div className="admin__error">Error: {error}</div>}

      {!error && rows.length === 0 && (
        <div className="admin__empty">
          No responses yet. Share the survey link — submissions will appear here.
        </div>
      )}

      <div className="admin__list">
        {rows.map((r, idx) => (
          <details className="rcard" key={r.id} open={idx === 0}>
            <summary className="rsum">
              <span className="rsum__n">#{rows.length - idx}</span>
              <span className="rsum__time">{fmtDate(r.created_at)}</span>
              <span className="rsum__spec">{r.answers?.length ?? 0} answers</span>
              <span className="rsum__use">{snippet(r)}</span>
            </summary>
            <div className="rgrid">
              {(r.answers ?? []).map((a, i) => (
                <div className="rrow" key={a.id || i}>
                  <div className="rq">{a.question || "—"}</div>
                  <div className="ra">{fmtAnswer(a.answer)}</div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>

      <footer className="admin__foot">
        Field study · showing up to 1000 most recent responses
      </footer>
    </div>
  );
}
