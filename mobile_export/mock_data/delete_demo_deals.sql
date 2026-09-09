-- Удаление выдуманных демо-сделок (CRM станет пустым под реальные сделки).
-- Запусти в Supabase → SQL Editor → Run.

delete from public.deals where id in ('BC-1042','BC-1039');
