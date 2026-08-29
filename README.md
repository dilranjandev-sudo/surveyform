# Diagnostic Workflow Field Study

An interactive, one-question-at-a-time survey for clinicians, built with **Next.js** (App Router) and styled as a clinical monitoring instrument. Responses are stored in **Supabase** (Postgres).

## Local development

```bash
npm install
npm run dev
```

Open the URL it prints (e.g. http://localhost:3000).

Create `.env.local` from `.env.example` and set `DATABASE_URL`. Without it, submissions fall back to a local file at `data/responses.ndjson`.

## Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste [`supabase/schema.sql`](supabase/schema.sql) → **Run** (creates the `responses` table). *Note: the app also auto-creates the table on first insert, so this is optional but recommended.*
3. **Connect** (top bar) → copy a connection string:
   - **Session pooler** is recommended for hosting.
   - Put it in `.env.local` as `DATABASE_URL` (fill in your DB password).

Test the connection any time:

```bash
node --env-file=.env.local scripts/db-test.mjs
```

## Deploy on Hostinger (Node.js app)

Hostinger Business Web Hosting with Node.js support:

1. **Push the code to the server** — via Git (hPanel → Git) or upload the project folder over SFTP/File Manager (you can exclude `node_modules`, `.next`, and `data`).
2. **hPanel → Node.js** → **Create application**:
   - **Node version:** 18+ (20 recommended)
   - **Application root:** the folder you uploaded
   - **Application startup file:** `server.js`
3. **Environment variables** (in the Node.js app settings) → add:
   - `DATABASE_URL` = your Supabase connection string
   - `NODE_ENV` = `production`
4. **Install & build** — open the app's terminal / SSH in the app root and run:
   ```bash
   npm install
   npm run build
   ```
5. **Start / Restart** the application from hPanel. Passenger runs `server.js`, which serves the built Next.js app on the port Hostinger provides.

Every submission now writes to your Supabase `responses` table.

> **Tip:** whenever you change the code, run `npm run build` again and **Restart** the app.

## Viewing responses

In Supabase → **Table Editor → responses**, or in the SQL editor:

```sql
select * from public.responses_readable order by created_at desc;
```

The full answer set for each submission lives in the `answers` JSON column.

## Editing the survey

All questions live in [`lib/questions.ts`](lib/questions.ts) — edit text, options, or add questions there. Supported types: `single`, `multi`, `text`, `scale`.

## Security note

`DATABASE_URL` contains your database password — it lives only in `.env.local` (gitignored) and in Hostinger's environment variables. Never commit it. If it's ever exposed, reset it in Supabase → **Settings → Database → Reset database password** and update the env value.
