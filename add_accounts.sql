-- Реестр аккаунтов «чей клиент/партнёр» + импорт из внешних систем.
-- Запусти в Supabase → SQL Editor → Run.

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text,               -- компания / клиент
  kind text default 'client',  -- client | partner | prospect
  contact_name text,
  email text,
  phone text,
  owner text,              -- имя сотрудника-владельца
  owner_role text,
  stage text,
  source text,             -- откуда (Zoho, DocuSign, Pandayo, Hoory, Jira, manual, import)
  notes text,
  created_at timestamptz default now()
);

alter table public.accounts enable row level security;
drop policy if exists "accounts all" on public.accounts;
create policy "accounts all" on public.accounts for all using (true) with check (true);
