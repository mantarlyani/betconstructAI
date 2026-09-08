-- ПРОТОТИП: открыть чтение/запись applications и vendors под публичным ключом,
-- чтобы админка (вход без Supabase Auth) могла читать заявки и ставить бейджи.
-- ⚠ Это ослабляет защиту (данные доступны с publishable key). Перед боевым
--    запуском вернуть строгие политики (см. database.sql) + Supabase Auth.

-- applications: читать и обновлять всем
drop policy if exists "app read own or staff" on public.applications;
drop policy if exists "app update staff" on public.applications;
drop policy if exists "app read all" on public.applications;
drop policy if exists "app update all" on public.applications;
create policy "app read all"   on public.applications for select using (true);
create policy "app update all" on public.applications for update using (true) with check (true);

-- vendors: читать и управлять всем
drop policy if exists "vendors public read" on public.vendors;
drop policy if exists "vendors staff write" on public.vendors;
drop policy if exists "vendors read all" on public.vendors;
drop policy if exists "vendors write all" on public.vendors;
create policy "vendors read all"  on public.vendors for select using (true);
create policy "vendors write all" on public.vendors for all using (true) with check (true);
