-- Пересоздание таблицы deals под текстовые id (BC-xxxx), как использует приложение.
-- Старая таблица была с id типа uuid — из-за этого падало удаление и не сохранялись сделки.
-- CRM всё равно должен быть пустым под реальные данные, поэтому пересоздаём.
-- Запусти в Supabase → SQL Editor → Run.

drop table if exists public.deals cascade;

create table public.deals (
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
