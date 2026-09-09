-- Модуль «Соглашения» (замена DocuSign): договор → отправка → подпись → оплата setup fee.
-- Запусти в Supabase → SQL Editor → Run.

create table if not exists public.agreements (
  id uuid primary key default gen_random_uuid(),
  deal_id text,
  partner text,
  title text,
  template text,
  body text,
  doc_url text,
  amount numeric,
  currency text default 'EUR',
  signer_name text,
  signer_email text,
  status text default 'draft',   -- draft | sent | signed | completed
  sent_at timestamptz,
  signed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now()
);

alter table public.agreements enable row level security;
drop policy if exists "agreements all" on public.agreements;
create policy "agreements all" on public.agreements for all using (true) with check (true);
