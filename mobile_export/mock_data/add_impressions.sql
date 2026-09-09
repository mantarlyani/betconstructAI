-- Реальный счётчик показов вендоров в Marketplace.
-- 1) колонка impressions; 2) функция инкремента (вызывается с сайта через db.rpc).
-- Запусти в Supabase → SQL Editor → Run.

alter table public.vendors add column if not exists impressions int default 0;

create or replace function public.bump_impression(vid uuid)
returns void
language sql
security definer
as $$
  update public.vendors set impressions = coalesce(impressions,0) + 1 where id = vid;
$$;

grant execute on function public.bump_impression(uuid) to anon, authenticated;
