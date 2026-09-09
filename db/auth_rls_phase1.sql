-- ============================================================================
-- BetConstructAI — Auth Phase 1.1: роли + RLS
-- ============================================================================
-- Модель:
--   • Гости входят через Supabase Anonymous Auth → у каждого есть auth.uid().
--   • Сотрудники/админы входят через Supabase Auth (email+пароль) → profiles.role.
--   • Роль берётся из public.profiles (id = auth.uid()). Нет профиля = 'visitor'.
--   • Публичные таблицы: гость может ТОЛЬКО вставлять (заявка/лид/событие/чат),
--     читать — лишь своё (чат по auth.uid()) и активных вендоров.
--   • Таблицы бэк-офиса: только staff/admin.
--
-- ВАЖНО: этот файл НЕ включает RLS (см. блок ENABLE в конце — он закомментирован).
-- Политики «спят», пока RLS не включён на таблице. Включение = отдельный cutover,
-- одновременно с деплоем клиента на Supabase Auth. Так прод не ломается по дороге.
-- ============================================================================

-- ---------- 1. Хелперы роли ----------
create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select role::text from public.profiles where id = auth.uid()), 'visitor')
$$;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select public.my_role() = 'admin'
$$;

-- любой сотрудник бэк-офиса (включая админа)
create or replace function public.is_staff()
returns boolean language sql stable as $$
  select public.my_role() in ('sales','lawyer','moderator','marketing','finance','admin')
$$;

-- ---------- 2. Профиль автоматически при создании auth-пользователя ----------
-- Гость → visitor; сотрудник заводится с нужной ролью через админку (или сидом ниже).
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name',''),
          coalesce(nullif(new.raw_user_meta_data->>'role','')::public.user_role, 'visitor'::public.user_role))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------- 3. Политики: ПУБЛИЧНЫЕ таблицы (гость пишет, читает только своё) ----------

-- events: любой авторизованный (включая гостя) может ВСТАВЛЯТЬ; читать — только staff.
drop policy if exists ev_insert on public.events;
create policy ev_insert on public.events for insert to authenticated with check (true);
drop policy if exists ev_staff_read on public.events;
create policy ev_staff_read on public.events for select to authenticated using (public.is_staff());

-- visitors: гость вставляет/обновляет свою запись; staff читает всё.
drop policy if exists vis_insert on public.visitors;
create policy vis_insert on public.visitors for insert to authenticated with check (true);
drop policy if exists vis_update_own on public.visitors;
create policy vis_update_own on public.visitors for update to authenticated
  using (user_id = auth.uid() or public.is_staff()) with check (true);
drop policy if exists vis_staff_read on public.visitors;
create policy vis_staff_read on public.visitors for select to authenticated using (public.is_staff());

-- leads: гость создаёт лид; staff управляет.
drop policy if exists lead_insert on public.leads;
create policy lead_insert on public.leads for insert to authenticated with check (true);
drop policy if exists lead_staff_all on public.leads;
create policy lead_staff_all on public.leads for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- applications: гость подаёт заявку; staff читает/модерирует.
drop policy if exists app_insert on public.applications;
create policy app_insert on public.applications for insert to authenticated with check (true);
drop policy if exists app_staff_rw on public.applications;
create policy app_staff_rw on public.applications for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- vendors: читают все авторизованные (только активные для не-staff); staff — всё.
drop policy if exists vend_read on public.vendors;
create policy vend_read on public.vendors for select to authenticated
  using (active is true or public.is_staff());
drop policy if exists vend_staff_write on public.vendors;
create policy vend_staff_write on public.vendors for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- threads: гость создаёт свой visitor-тред и видит только его (guest_key = его uid).
drop policy if exists thr_insert on public.threads;
create policy thr_insert on public.threads for insert to authenticated
  with check (public.is_staff() or (kind = 'visitor' and guest_key = auth.uid()::text));
drop policy if exists thr_read on public.threads;
create policy thr_read on public.threads for select to authenticated
  using (public.is_staff() or guest_key = auth.uid()::text);
drop policy if exists thr_staff_write on public.threads;
create policy thr_staff_write on public.threads for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- thread_messages: гость пишет/читает только в своём треде; staff — везде.
drop policy if exists tm_insert on public.thread_messages;
create policy tm_insert on public.thread_messages for insert to authenticated
  with check (
    public.is_staff()
    or exists (select 1 from public.threads t where t.id = thread_id and t.guest_key = auth.uid()::text)
  );
drop policy if exists tm_read on public.thread_messages;
create policy tm_read on public.thread_messages for select to authenticated
  using (
    public.is_staff()
    or exists (select 1 from public.threads t where t.id = thread_id and t.guest_key = auth.uid()::text)
  );

-- agreements: подпись по deep-link. Гость видит/обновляет только по signer_email == его email;
-- staff — всё. (Уточнить в cutover, если подпись должна быть доступна без входа.)
drop policy if exists agr_staff_all on public.agreements;
create policy agr_staff_all on public.agreements for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists agr_sign_read on public.agreements;
create policy agr_sign_read on public.agreements for select to authenticated
  using (signer_email = (auth.jwt() ->> 'email'));
drop policy if exists agr_sign_update on public.agreements;
create policy agr_sign_update on public.agreements for update to authenticated
  using (signer_email = (auth.jwt() ->> 'email'))
  with check (signer_email = (auth.jwt() ->> 'email'));

-- ---------- 4. Политики: БЭК-ОФИС (только staff/admin) ----------
-- Полный доступ для staff по каждой таблице бэк-офиса.
drop policy if exists deals_staff_all on public.deals;
create policy deals_staff_all on public.deals for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists accounts_staff_all on public.accounts;
create policy accounts_staff_all on public.accounts for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists contacts_staff_all on public.contacts;
create policy contacts_staff_all on public.contacts for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists comm_messages_staff_all on public.comm_messages;
create policy comm_messages_staff_all on public.comm_messages for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists tasks_staff_all on public.tasks;
create policy tasks_staff_all on public.tasks for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists documents_staff_all on public.documents;
create policy documents_staff_all on public.documents for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists banners_staff_all on public.banners;
create policy banners_staff_all on public.banners for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists content_flags_staff_all on public.content_flags;
create policy content_flags_staff_all on public.content_flags for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists shifts_staff_all on public.shifts;
create policy shifts_staff_all on public.shifts for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- staff: читают все сотрудники; изменяет только админ. (Колонка pass уже REVOKE'нута отдельно.)
drop policy if exists staff_read on public.staff;
create policy staff_read on public.staff for select to authenticated using (public.is_staff());
drop policy if exists staff_admin_write on public.staff;
create policy staff_admin_write on public.staff for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- profiles: каждый видит свой; staff видит все; изменяет админ.
drop policy if exists prof_self on public.profiles;
create policy prof_self on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());
drop policy if exists prof_admin_write on public.profiles;
create policy prof_admin_write on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 5. CUTOVER — включение enforcement.
-- ============================================================================
-- ФАКТ: RLS уже ВКЛЮЧЁН на таблицах (историческое состояние), но на каждой висят
-- СТАРЫЕ открытые политики для роли {public} (qual = true / insert any) —
-- они и разрешают всё текущему anon-клиенту. Мои новые политики {authenticated}
-- добавлены рядом и объединяются через OR, поэтому сейчас ничего не сломано.
--
-- CUTOVER = УДАЛИТЬ старые открытые {public}-политики, оставив только мои.
-- Выполнять ТОЛЬКО после того, как клиент переведён на Supabase Auth
-- (гость → signInAnonymously, сотрудник/админ → signInWithPassword),
-- иначе anon-запросы клиента перестанут проходить.
--
-- Найти все легаси-политики к удалению:
--   select schemaname, tablename, policyname, cmd, roles::text, qual::text
--   from pg_policies
--   where schemaname='public' and roles = '{public}'
--   order by tablename, policyname;
--
-- Затем для каждой: drop policy if exists "<policyname>" on public.<tablename>;
-- (делать одним заходом в транзакции, с немедленной проверкой, что
--  публичные INSERT'ы гостя и чтения бэк-офиса сотрудником работают.)
