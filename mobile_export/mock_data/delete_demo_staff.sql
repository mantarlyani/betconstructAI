-- Удаление выдуманных демо-сотрудников (оставляем только реальную команду из графика).
-- Запусти в Supabase → SQL Editor → Run.

delete from public.staff where login in (
  'ani.petrosyan',
  'armen.kazaryan',
  'lilit.sarkisyan',
  'narek.avetisyan',
  'david.khachatryan',
  'gor.mnatsakanyan'
);
