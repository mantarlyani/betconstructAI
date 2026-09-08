-- Добавляет описание продукта в таблицу vendors, чтобы одобренный продукт
-- показывался с описанием в Marketplace и попадал в базу знаний AI-советника.
-- Запусти в Supabase → SQL Editor → Run (безопасно, идемпотентно).

alter table public.vendors add column if not exists description text;
