import { getSql } from "../../lib/db";
import { questions } from "../../lib/questions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ans = { id: number; question?: string; answer: unknown };
type Row = {
  id: string;
  created_at: string;
  submitted_at: string | null;
  answers: Ans[];
};

const titleById = new Map(questions.map((q) => [q.id, q.title]));

function fmtDate(d: string) {
  return new Date(d).toISOString().slice(0, 16).replace("T", " ") + " UTC";
}
function fmtAnswer(v: unknown) {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

export default async function AdminPage() {
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
            BIQAD<b>X</b> <span>· Responses</span>
          </div>
          <div className="admin__count">
            {error ? "—" : `${rows.length} response${rows.length === 1 ? "" : "s"}`}
          </div>
        </div>
        <div className="admin__actions">
          <a className="abtn" href="/admin">Refresh</a>
          <a className="abtn abtn--primary" href="/api/admin/export">Export CSV</a>
        </div>
      </header>

      {error && <div className="admin__error">Error: {error}</div>}

      {!error && rows.length === 0 && (
        <div className="admin__empty">
          No responses yet. Share the survey link — submissions will appear here.
        </div>
      )}

      <div className="admin__list">
        {rows.map((r, idx) => {
          const map = new Map(r.answers?.map((a) => [a.id, a.answer]) ?? []);
          const specialty = fmtAnswer(map.get(1));
          const score = map.get(11);
          const wouldUse = fmtAnswer(map.get(10));
          return (
            <details className="rcard" key={r.id} open={idx === 0}>
              <summary className="rsum">
                <span className="rsum__n">#{rows.length - idx}</span>
                <span className="rsum__time">{fmtDate(r.created_at)}</span>
                <span className="rsum__spec">{specialty}</span>
                {typeof score === "number" && (
                  <span className="rsum__score" data-v={score}>
                    value {score}/10
                  </span>
                )}
                <span className="rsum__use">{wouldUse}</span>
              </summary>
              <div className="rgrid">
                {(r.answers ?? []).map((a) => (
                  <div className="rrow" key={a.id}>
                    <div className="rq">
                      <span className="rq__n">Q{a.id}</span>
                      {a.question || titleById.get(a.id) || "—"}
                    </div>
                    <div className="ra">{fmtAnswer(a.answer)}</div>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>

      <footer className="admin__foot">
        BIQADX Diagnostics · showing up to 1000 most recent responses
      </footer>
    </div>
  );
}
