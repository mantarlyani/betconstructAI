-- Кабинет сотрудника: таблица staff с логинами/паролями для входа в личный кабинет.
-- Запусти в Supabase → SQL Editor → Run.

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  name text,
  role text,
  login text unique,
  pass text,
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.staff enable row level security;
drop policy if exists "staff all" on public.staff;
create policy "staff all" on public.staff for all using (true) with check (true);

-- стартовые аккаунты (совпадают с демо в админке)
insert into public.staff (name, role, login, pass) values
  ('Ани Петросян','Sales','ani.petrosyan','<REDACTED>'),
  ('Армен Казарян','Sales','armen.kazaryan','<REDACTED>'),
  ('Лилит Саркисян','Юрист','lilit.sarkisyan','<REDACTED>'),
  ('Нарек Аветисян','Service Sales','narek.avetisyan','<REDACTED>'),
  ('Давид Хачатрян','PM','david.khachatryan','<REDACTED>'),
  ('Гор Мнацаканян','Account Manager','gor.mnatsakanyan','<REDACTED>')
on conflict (login) do nothing;
