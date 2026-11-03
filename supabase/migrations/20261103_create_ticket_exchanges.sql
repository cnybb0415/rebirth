-- 콘서트 티켓 교환 게시판 (src/lib/exchangeDb.ts)
create table if not exists public.ticket_exchanges (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('date', 'seat')),
  have_date text not null,
  want_dates text[] not null default '{}',
  have_seat text check (char_length(have_seat) <= 40),
  want_seat text check (char_length(want_seat) <= 40),
  qty smallint not null default 1 check (qty between 1 and 4),
  contact_type text not null check (contact_type in ('x', 'openchat')),
  contact text not null check (char_length(contact) <= 120),
  memo text check (char_length(memo) <= 200),
  status text not null default 'open' check (status in ('open', 'done')),
  pw_hash text not null,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists ticket_exchanges_list_idx on public.ticket_exchanges (kind, have_date, created_at desc);
create index if not exists ticket_exchanges_ip_idx on public.ticket_exchanges (ip_hash, created_at desc);

-- 서버(service role)만 읽고 씀. 정책 없이 RLS 를 켜서 공개 anon 키로는 접근 불가
alter table public.ticket_exchanges enable row level security;
