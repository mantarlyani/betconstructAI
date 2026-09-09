-- Хранилище файлов (Supabase Storage) + раздел «Документы» + вложения в чат.
-- Запусти в Supabase → SQL Editor → Run.

-- 1) Публичный бакет для загрузок (документы, фото/видео чата)
insert into storage.buckets (id, name, public)
values ('uploads','uploads', true)
on conflict (id) do update set public = true;

-- прототип: разрешить загрузку и чтение всем (публичный ключ)
drop policy if exists "uploads read"   on storage.objects;
create policy "uploads read"   on storage.objects for select using (bucket_id = 'uploads');
drop policy if exists "uploads insert" on storage.objects;
create policy "uploads insert" on storage.objects for insert with check (bucket_id = 'uploads');
drop policy if exists "uploads delete" on storage.objects;
create policy "uploads delete" on storage.objects for delete using (bucket_id = 'uploads');

-- 2) Таблица документов
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text,
  category text default 'Общее',
  file_url text,
  file_type text,      -- image | video | pdf | file
  file_name text,
  size_bytes bigint,
  uploaded_by text,
  vendor_id uuid,
  created_at timestamptz default now()
);
alter table public.documents enable row level security;
drop policy if exists "docs all" on public.documents;
create policy "docs all" on public.documents for all using (true) with check (true);

-- 3) Вложения в сообщения чата (фото/видео)
alter table public.messages add column if not exists file_url  text;
alter table public.messages add column if not exists file_type text;
