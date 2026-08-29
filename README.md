# BIQADX — Diagnostic Workflow Field Study

An interactive, one-question-at-a-time survey for clinicians, built with **Next.js** (App Router) and styled as a clinical monitoring instrument. Responses are stored in **Supabase**.

## Local development

```bash
npm install
npm run dev
```

Open the URL it prints (e.g. http://localhost:3000).

Without Supabase env vars, submissions fall back to a local file at `data/responses.ndjson` so you can test offline.

## 1 · Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and **Run**. This creates the `responses` table (locked down with RLS).
3. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY`
4. For local testing, copy `.env.example` to `.env.local` and fill both values.

> The service-role key is a server secret. It's only used inside `app/api/submit/route.ts` (server-side) and is never sent to the browser. Never commit it.

## 2 · Push to GitHub

```bash
git add .
git commit -m "Initial commit: BIQADX survey"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

## 3 · Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import your GitHub repo.
2. Framework preset auto-detects **Next.js** — no config needed.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Deploy.** Done — every submission lands in your Supabase `responses` table.

## Viewing responses

In Supabase → **Table Editor → responses**, or run in the SQL editor:

```sql
select * from public.responses_readable order by created_at desc;
```

The full answer set for each submission lives in the `answers` JSON column.

## Editing the survey

All questions live in [`lib/questions.ts`](lib/questions.ts) — edit text, options, or add questions there. Supported types: `single`, `multi`, `text`, `scale`.
