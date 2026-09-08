-- Сделки в БД (единый источник для админки и кабинета сотрудника) + владелец лида.
-- Запусти в Supabase → SQL Editor → Run.

create table if not exists public.deals (
  id text primary key,
  client text,
  resp text, ssales text, pm text, am text,
  stage text default 'lead',
  status text default 'active',
  agr jsonb default '{"signed":false,"paid":false}'::jsonb,
  flow jsonb default '[false,false,false,false,false,false,false]'::jsonb,
  steps jsonb default '[]'::jsonb,
  rr_done boolean default false,
  kick_done boolean default false,
  created_at timestamptz default now()
);
alter table public.deals enable row level security;
drop policy if exists "deals all" on public.deals;
create policy "deals all" on public.deals for all using (true) with check (true);

-- (демо-сделки убраны — CRM наполняется реальными данными)

-- владелец лида (для «Мои лиды» в кабинете)
alter table public.leads add column if not exists owner text;
