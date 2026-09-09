-- Лиды: запросы демо от посетителей (кнопка «Запросить демо» в Marketplace).
-- Запусти в Supabase → SQL Editor → Run.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  vendor text,
  vendor_id uuid,
  product text,
  visitor_name text,
  contact text,
  message text,
  source text default 'demo_request',
  status text default 'new',
  created_at timestamptz default now()
);

alter table public.leads enable row level security;

-- прототип: посетитель (публичный ключ) может создать лид, персонал — читать
drop policy if exists "leads insert any" on public.leads;
create policy "leads insert any" on public.leads for insert with check (true);
drop policy if exists "leads read all" on public.leads;
create policy "leads read all" on public.leads for select using (true);
