-- Смены сотрудников (присутствие: вход/выход) + открытое чтение событий для аналитики админки.
-- Запусти в Supabase → SQL Editor → Run.

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  staff text not null,
  role text,
  online_at timestamptz default now(),
  offline_at timestamptz
);

alter table public.shifts enable row level security;
drop policy if exists "shifts all" on public.shifts;
create policy "shifts all" on public.shifts for all using (true) with check (true);

-- прототип: разрешить админке (публичный ключ) читать события для аналитики
drop policy if exists "events read all" on public.events;
create policy "events read all" on public.events for select using (true);
