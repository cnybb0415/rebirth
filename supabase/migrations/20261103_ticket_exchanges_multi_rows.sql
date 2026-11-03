-- 가진 티켓·원하는 회차를 여러 줄로 (src/lib/exchangeDb.ts)
-- 예전 한 줄짜리 칸(have_date, have_seat, want_seat, qty)은 쓰지 않지만 지우지 않고 비워 둠
alter table public.ticket_exchanges
  add column if not exists haves jsonb not null default '[]'::jsonb,
  add column if not exists wants jsonb not null default '[]'::jsonb,
  add column if not exists have_dates text[] not null default '{}';

alter table public.ticket_exchanges alter column have_date drop not null;
alter table public.ticket_exchanges alter column qty drop not null;

alter table public.ticket_exchanges
  add constraint ticket_exchanges_haves_size check (jsonb_array_length(haves) between 1 and 6),
  add constraint ticket_exchanges_wants_size check (jsonb_array_length(wants) between 1 and 6);

create index if not exists ticket_exchanges_kind_idx on public.ticket_exchanges (kind, created_at desc);
create index if not exists ticket_exchanges_have_dates_idx on public.ticket_exchanges using gin (have_dates);
