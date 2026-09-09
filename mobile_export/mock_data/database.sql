-- ============================================================
-- BetConstructAI.marketplace — схема базы данных (Supabase/PostgreSQL)
-- Запустить в Supabase → SQL Editor → New query → Run
-- Включает: таблицы, enum-типы, связи, RLS-политики, pgvector для AI.
-- ============================================================

create extension if not exists "pgcrypto";
create extension if not exists vector;

-- ---------- ENUM-типы ----------
do $$ begin
  create type user_role as enum ('visitor','sales','lawyer','moderator','marketing','finance','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_kind as enum ('game','payment','platform','tool','license','affiliate','marketing');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_status as enum ('pending','approved','partner','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type deal_stage as enum ('new','contact','demo','negotiation','purchase');
exception when duplicate_object then null; end $$;

-- ---------- profiles (расширяет auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  contact text,                 -- email или телефон
  role user_role not null default 'visitor',
  online boolean default false,
  last_seen timestamptz,
  created_at timestamptz default now()
);

-- Роль текущего пользователя (для RLS)
create or replace function public.my_role() returns user_role
  language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_staff() returns boolean
  language sql stable as
$$ select public.my_role() in ('sales','lawyer','moderator','marketing','finance','admin') $$;

create or replace function public.is_admin() returns boolean
  language sql stable as
$$ select public.my_role() in ('admin','moderator') $$;

-- Авто-создание profile при регистрации
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, contact)
  values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.email, new.phone));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- visitors (анонимный трекинг устройств) ----------
create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  anon_id text unique not null,        -- UUID из localStorage браузера
  fingerprint text,                    -- отпечаток устройства (FingerprintJS)
  device jsonb,                        -- user-agent, экран, таймзона, язык
  geo text,                            -- примерное гео
  user_id uuid references public.profiles(id),
  first_seen timestamptz default now(),
  last_seen timestamptz default now()
);

-- ---------- events (действия посетителя) ----------
create table if not exists public.events (
  id bigint generated always as identity primary key,
  visitor_anon text not null,
  session_id text,
  type text not null,                  -- 'page','click','submit','ai_query'…
  target text,                         -- что именно (экран/кнопка/ссылка)
  meta jsonb,
  created_at timestamptz default now()
);
create index if not exists events_visitor_idx on public.events(visitor_anon);
create index if not exists events_created_idx on public.events(created_at);

-- ---------- applications (заявки партнёров и аффилейтов) ----------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  kind app_kind not null,
  company text not null,
  contact_name text,
  email text not null,
  phone text,
  site text,
  country text,
  reg_no text,
  licenses text,
  product_name text,
  category text,
  description text,
  value_prop text,
  features text,
  demo_url text,
  regions text,
  forbidden_markets text,
  languages text,
  currencies text,
  crypto boolean default false,
  compliance text,
  model text,
  price text,
  platform_share text,
  ai_tags jsonb,
  status app_status not null default 'pending',
  submitted_by uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- ---------- vendors + listings (одобренные → в Marketplace) ----------
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id),
  name text not null,
  kind app_kind,
  category text,
  badge app_status default 'approved',  -- approved | partner
  match_score int,
  regions text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  title text,
  description text,
  media jsonb,
  price text,
  created_at timestamptz default now()
);

-- ---------- deals + steps + payouts (CRM) ----------
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  client text,
  responsible uuid references public.profiles(id),
  stage deal_stage default 'new',
  amount numeric default 0,
  created_at timestamptz default now()
);

create table if not exists public.deal_steps (
  id bigint generated always as identity primary key,
  deal_id uuid references public.deals(id) on delete cascade,
  name text,
  by_name text,
  at timestamptz default now()
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  sales_id uuid references public.profiles(id),
  amount numeric,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ---------- chats + messages (realtime) ----------
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  visitor_anon text,
  visitor_name text,
  rep_id uuid references public.profiles(id),
  online boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  chat_id uuid references public.chats(id) on delete cascade,
  sender text not null,               -- 'visitor' | 'staff'
  body text not null,
  created_at timestamptz default now()
);
create index if not exists messages_chat_idx on public.messages(chat_id);

-- ---------- контент (баннеры, флаги разделов) ----------
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  active boolean default true,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists public.content_flags (
  key text primary key,
  enabled boolean default true
);

-- ---------- база знаний для AI (RAG, pgvector) ----------
create table if not exists public.kb_docs (
  id uuid primary key default gen_random_uuid(),
  title text,
  url text,
  content text,
  created_at timestamptz default now()
);

create table if not exists public.kb_chunks (
  id bigint generated always as identity primary key,
  doc_id uuid references public.kb_docs(id) on delete cascade,
  content text,
  embedding vector(768)               -- Gemini text-embedding-004 = 768
);

-- ============================================================
-- RLS (Row-Level Security)
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.visitors        enable row level security;
alter table public.events          enable row level security;
alter table public.applications    enable row level security;
alter table public.vendors         enable row level security;
alter table public.listings        enable row level security;
alter table public.deals           enable row level security;
alter table public.deal_steps      enable row level security;
alter table public.payouts         enable row level security;
alter table public.chats           enable row level security;
alter table public.messages        enable row level security;
alter table public.banners         enable row level security;
alter table public.content_flags   enable row level security;

-- profiles: свой профиль читает/меняет сам; персонал видит всех; админ всё
create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "profiles self update" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- visitors/events: вставка разрешена всем (аноним-трекинг), чтение — персоналу
create policy "events insert any" on public.events for insert with check (true);
create policy "events staff read" on public.events for select using (public.is_staff());
create policy "visitors upsert any" on public.visitors for insert with check (true);
create policy "visitors update any" on public.visitors for update using (true);
create policy "visitors staff read" on public.visitors for select using (public.is_staff());

-- applications: заявитель создаёт и видит свои; модератор/админ — все и меняет статус
create policy "app insert" on public.applications for insert with check (true);
create policy "app read own or staff" on public.applications for select using (submitted_by = auth.uid() or public.is_staff());
create policy "app update staff" on public.applications for update using (public.is_admin());

-- vendors/listings: публичное чтение активных; управление — персонал
create policy "vendors public read" on public.vendors for select using (active = true or public.is_staff());
create policy "vendors staff write" on public.vendors for all using (public.is_admin()) with check (public.is_admin());
create policy "listings public read" on public.listings for select using (true);
create policy "listings staff write" on public.listings for all using (public.is_admin()) with check (public.is_admin());

-- deals: sales видит свои; админ всё
create policy "deals read" on public.deals for select using (responsible = auth.uid() or public.is_admin());
create policy "deals write staff" on public.deals for all using (public.is_staff()) with check (public.is_staff());
create policy "deal_steps read" on public.deal_steps for select using (public.is_staff());
create policy "deal_steps insert" on public.deal_steps for insert with check (public.is_staff());
create policy "payouts read" on public.payouts for select using (sales_id = auth.uid() or public.is_admin());
create policy "payouts admin" on public.payouts for all using (public.is_admin()) with check (public.is_admin());

-- chats/messages: персонал видит всё; вставка сообщений — участникам
create policy "chats staff read" on public.chats for select using (public.is_staff());
create policy "chats insert any" on public.chats for insert with check (true);
create policy "messages read staff" on public.messages for select using (public.is_staff());
create policy "messages insert any" on public.messages for insert with check (true);

-- banners/content: публичное чтение, запись — админ
create policy "banners public read" on public.banners for select using (true);
create policy "banners admin" on public.banners for all using (public.is_admin()) with check (public.is_admin());
create policy "flags public read" on public.content_flags for select using (true);
create policy "flags admin" on public.content_flags for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Стартовые данные (флаги разделов index)
-- ============================================================
insert into public.content_flags(key,enabled) values
  ('quick',true),('live',true),('promo',true),('sections',true)
on conflict (key) do nothing;

-- Готово. После первого пользователя назначьте себе роль admin:
--   update public.profiles set role='admin' where contact='ВАШ_EMAIL';
