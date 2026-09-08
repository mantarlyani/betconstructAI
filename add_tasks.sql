-- Модуль «Задачи/запросы ресурсов» (замена Jira): внутренние задачи отделов и запросы PM/Service Sales.
-- Запусти в Supabase → SQL Editor → Run.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  type text default 'dept_task',   -- resource_request | dept_task | bug
  dept text,                         -- PM | Service Sales | Sales | Legal | Dev | Ops
  assignee text,
  requester text,
  deal_id text,
  priority text default 'P3',        -- P1 | P2 | P3 | P4
  status text default 'open',        -- open | in_progress | blocked | done
  due_date date,
  created_at timestamptz default now()
);

alter table public.tasks enable row level security;
drop policy if exists "tasks all" on public.tasks;
create policy "tasks all" on public.tasks for all using (true) with check (true);
