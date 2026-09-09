-- Рейтинг по сменам (из графика чат-смен). Требует add_staff.sql/add_sales_team.sql.
-- Запусти в Supabase -> SQL Editor -> Run.

alter table public.staff add column if not exists shifts_total int default 0;
alter table public.staff add column if not exists shifts_weekend int default 0;

update public.staff set shifts_total=15, shifts_weekend=6 where login='alexander.grigorian';
update public.staff set shifts_total=12, shifts_weekend=3 where login='mighrig.ayvazyan';
update public.staff set shifts_total=13, shifts_weekend=2 where login='arinka.ayvazyan';
update public.staff set shifts_total=12, shifts_weekend=0 where login='milena.hakobyan';
update public.staff set shifts_total=12, shifts_weekend=3 where login='vahagn.hovhannisyan';
update public.staff set shifts_total=11, shifts_weekend=3 where login='khoren.khorkhoruni';
update public.staff set shifts_total=11, shifts_weekend=2 where login='elnaz.rohandeh';
update public.staff set shifts_total=13, shifts_weekend=3 where login='suren.ghazaryan';
update public.staff set shifts_total=13, shifts_weekend=3 where login='arpi.mnatsakanyan';
update public.staff set shifts_total=11, shifts_weekend=2 where login='sona.khachatryan';
update public.staff set shifts_total=10, shifts_weekend=1 where login='amalya.danielyan';
update public.staff set shifts_total=8, shifts_weekend=1 where login='violeta.potikyan';
update public.staff set shifts_total=9, shifts_weekend=3 where login='seda.hovsepyan';
update public.staff set shifts_total=11, shifts_weekend=2 where login='armine.martirosyan';
update public.staff set shifts_total=11, shifts_weekend=1 where login='kevork.nokhoudian';
update public.staff set shifts_total=11, shifts_weekend=1 where login='maria.manukyan';
update public.staff set shifts_total=10, shifts_weekend=0 where login='anahit.khachatryan';
update public.staff set shifts_total=8, shifts_weekend=2 where login='kamsar.badalyan';
update public.staff set shifts_total=9, shifts_weekend=0 where login='gor.hakobyan';
update public.staff set shifts_total=8, shifts_weekend=1 where login='ruzanna.goroyan';
update public.staff set shifts_total=10, shifts_weekend=1 where login='lara.djorkaeff';
update public.staff set shifts_total=9, shifts_weekend=2 where login='marianna.vardanyan';
update public.staff set shifts_total=8, shifts_weekend=1 where login='ani.khachatryan';
update public.staff set shifts_total=7, shifts_weekend=0 where login='monika.kostanyan';
