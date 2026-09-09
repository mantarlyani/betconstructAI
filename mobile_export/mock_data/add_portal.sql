-- Доступ партнёра в кабинет: пароль из заявки + активация после одобрения.
-- Логин = email или телефон, уже сохранённые в applications. Запусти в Supabase → SQL Editor → Run.

alter table public.applications add column if not exists portal_pass   text;
alter table public.applications add column if not exists portal_active boolean default false;
