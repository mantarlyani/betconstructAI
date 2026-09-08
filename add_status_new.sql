-- Добавляет статус 'new' (New offer) в enum app_status,
-- чтобы модерация могла присваивать бейдж "New offer" вендорам.
-- Запусти в Supabase → SQL Editor → Run (идемпотентно).

alter type app_status add value if not exists 'new';
