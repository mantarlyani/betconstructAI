-- Реальный счётчик кликов вендоров (кнопка «Запросить демо»).
-- Запусти в Supabase → SQL Editor → Run.

alter table public.vendors add column if not exists clicks int default 0;

create or replace function public.bump_click(vid uuid)
returns void
language sql
security definer
as $$
  update public.vendors set clicks = coalesce(clicks,0) + 1 where id = vid;
$$;

grant execute on function public.bump_click(uuid) to anon, authenticated;
