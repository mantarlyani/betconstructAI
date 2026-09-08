-- Идемпотентная установка RLS-политик (безопасно запускать сколько угодно раз).
-- Запусти в Supabase → SQL Editor → вставь всё → Run.

-- На случай, если таблицы уже есть — включим RLS (повторно безвредно)
alter table if exists public.profiles      enable row level security;
alter table if exists public.visitors      enable row level security;
alter table if exists public.events        enable row level security;
alter table if exists public.applications  enable row level security;
alter table if exists public.vendors       enable row level security;
alter table if exists public.listings      enable row level security;
alter table if exists public.deals         enable row level security;
alter table if exists public.deal_steps    enable row level security;
alter table if exists public.payouts       enable row level security;
alter table if exists public.chats         enable row level security;
alter table if exists public.messages      enable row level security;
alter table if exists public.banners       enable row level security;
alter table if exists public.content_flags enable row level security;

-- profiles
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_staff());
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- events
drop policy if exists "events insert any" on public.events;
create policy "events insert any" on public.events for insert with check (true);
drop policy if exists "events staff read" on public.events;
create policy "events staff read" on public.events for select using (public.is_staff());

-- visitors
drop policy if exists "visitors upsert any" on public.visitors;
create policy "visitors upsert any" on public.visitors for insert with check (true);
drop policy if exists "visitors update any" on public.visitors;
create policy "visitors update any" on public.visitors for update using (true);
drop policy if exists "visitors staff read" on public.visitors;
create policy "visitors staff read" on public.visitors for select using (public.is_staff());

-- applications
drop policy if exists "app insert" on public.applications;
create policy "app insert" on public.applications for insert with check (true);
drop policy if exists "app read own or staff" on public.applications;
create policy "app read own or staff" on public.applications for select using (submitted_by = auth.uid() or public.is_staff());
drop policy if exists "app update staff" on public.applications;
create policy "app update staff" on public.applications for update using (public.is_admin());

-- vendors
drop policy if exists "vendors public read" on public.vendors;
create policy "vendors public read" on public.vendors for select using (active = true or public.is_staff());
drop policy if exists "vendors staff write" on public.vendors;
create policy "vendors staff write" on public.vendors for all using (public.is_admin()) with check (public.is_admin());

-- listings
drop policy if exists "listings public read" on public.listings;
create policy "listings public read" on public.listings for select using (true);
drop policy if exists "listings staff write" on public.listings;
create policy "listings staff write" on public.listings for all using (public.is_admin()) with check (public.is_admin());

-- deals
drop policy if exists "deals read" on public.deals;
create policy "deals read" on public.deals for select using (responsible = auth.uid() or public.is_admin());
drop policy if exists "deals write staff" on public.deals;
create policy "deals write staff" on public.deals for all using (public.is_staff()) with check (public.is_staff());

-- deal_steps
drop policy if exists "deal_steps read" on public.deal_steps;
create policy "deal_steps read" on public.deal_steps for select using (public.is_staff());
drop policy if exists "deal_steps insert" on public.deal_steps;
create policy "deal_steps insert" on public.deal_steps for insert with check (public.is_staff());

-- payouts
drop policy if exists "payouts read" on public.payouts;
create policy "payouts read" on public.payouts for select using (sales_id = auth.uid() or public.is_admin());
drop policy if exists "payouts admin" on public.payouts;
create policy "payouts admin" on public.payouts for all using (public.is_admin()) with check (public.is_admin());

-- chats
drop policy if exists "chats staff read" on public.chats;
create policy "chats staff read" on public.chats for select using (public.is_staff());
drop policy if exists "chats insert any" on public.chats;
create policy "chats insert any" on public.chats for insert with check (true);

-- messages
drop policy if exists "messages read staff" on public.messages;
create policy "messages read staff" on public.messages for select using (public.is_staff());
drop policy if exists "messages insert any" on public.messages;
create policy "messages insert any" on public.messages for insert with check (true);

-- banners
drop policy if exists "banners public read" on public.banners;
create policy "banners public read" on public.banners for select using (true);
drop policy if exists "banners admin" on public.banners;
create policy "banners admin" on public.banners for all using (public.is_admin()) with check (public.is_admin());

-- content_flags
drop policy if exists "flags public read" on public.content_flags;
create policy "flags public read" on public.content_flags for select using (true);
drop policy if exists "flags admin" on public.content_flags;
create policy "flags admin" on public.content_flags for all using (public.is_admin()) with check (public.is_admin());

-- стартовые флаги разделов (если ещё нет)
insert into public.content_flags(key,enabled) values
  ('quick',true),('live',true),('promo',true),('sections',true)
on conflict (key) do nothing;
