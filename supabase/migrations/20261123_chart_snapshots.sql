-- 엑소 차트 저장본 (매시 /api/charts/refresh 가 갱신, 사이트는 service role로만 읽음)
create table if not exists public.chart_snapshots (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.chart_snapshots enable row level security;
