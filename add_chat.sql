-- Живой чат и каналы (замена Hoory + Pandayo): визиторы, внутренние каналы, kickoff PM↔Партнёр.
-- Запусти в Supabase → SQL Editor → Run.

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  kind text default 'visitor',   -- visitor | internal | kickoff
  title text,
  deal_id text,
  partner text,
  guest_key text,                -- привязка визитора
  created_at timestamptz default now(),
  last_at timestamptz default now()
);

create table if not exists public.thread_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.threads(id) on delete cascade,
  sender text,
  role text default 'visitor',   -- staff | visitor | partner | system
  text text,
  file_url text,
  file_type text,
  created_at timestamptz default now()
);

alter table public.threads enable row level security;
alter table public.thread_messages enable row level security;
drop policy if exists "threads all" on public.threads;
create policy "threads all" on public.threads for all using (true) with check (true);
drop policy if exists "tmsg all" on public.thread_messages;
create policy "tmsg all" on public.thread_messages for all using (true) with check (true);

-- Supabase Realtime (не обязательно — есть polling-фолбэк, но так живее)
do $$
begin
  begin
    alter publication supabase_realtime add table public.thread_messages;
  exception when duplicate_object then null; when others then null;
  end;
end $$;
