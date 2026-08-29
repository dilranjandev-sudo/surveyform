-- BIQADX survey — Supabase schema
-- Run this once in your Supabase project: Dashboard → SQL Editor → paste → Run.

create table if not exists public.responses (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  submitted_at  timestamptz,
  answers       jsonb not null
);

-- Fast newest-first listing.
create index if not exists responses_created_at_idx
  on public.responses (created_at desc);

-- Lock the table down. RLS with NO policies means anon/public keys cannot
-- read or write it at all — only the service-role key (used server-side in
-- the /api/submit route) can insert. Survey data stays private.
alter table public.responses enable row level security;

-- Optional convenience view for eyeballing responses in the SQL editor.
-- Pulls a couple of common fields out of the JSON; the full data stays in `answers`.
create or replace view public.responses_readable as
select
  id,
  created_at,
  (answers -> 0 ->> 'answer')  as specialty,       -- Q1
  (answers -> 9 ->> 'answer')  as would_use,        -- Q10
  (answers -> 10 ->> 'answer') as value_score,      -- Q11 (0-10)
  (answers -> 14 ->> 'answer') as pilot_willing,    -- Q15
  answers
from public.responses;
