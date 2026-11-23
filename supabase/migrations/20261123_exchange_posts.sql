-- 교환 게시판 확장: 포토카드 · 굿즈 · 티켓 · 기타
-- 서버(service role)만 읽고 씀. 비밀번호·IP는 해시로만 저장
create table if not exists public.exchange_posts (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('photocard', 'goods', 'ticket', 'etc')),
  etc_label text,                        -- 기타일 때 무슨 물건인지 (필수)
  event_name text,                       -- 티켓: 공연 이름 (자유 입력)
  haves jsonb not null default '[]'::jsonb,
  wants jsonb not null default '[]'::jsonb,
  dates date[] not null default '{}',    -- 티켓: 글에 나온 공연 날짜들 (필터·자동 삭제용)
  photos text[] not null default '{}',   -- 저장소 경로 (exchange-photos 버킷)
  contact_type text not null check (contact_type in ('x', 'openchat')),
  contact text not null,
  memo text,
  status text not null default 'open' check (status in ('open', 'done')),
  pw_hash text not null,
  ip_hash text,
  pw_fail_count smallint not null default 0,
  pw_locked_until timestamptz,
  created_at timestamptz not null default now(),
  done_at timestamptz,
  deleted_at timestamptz,
  expires_at timestamptz not null,
  constraint etc_needs_label check (category <> 'etc' or coalesce(length(trim(etc_label)), 0) > 0),
  constraint ticket_needs_event check (category <> 'ticket' or coalesce(length(trim(event_name)), 0) > 0)
);
create index if not exists exchange_posts_list_idx on public.exchange_posts (category, created_at desc) where deleted_at is null;
create index if not exists exchange_posts_expires_idx on public.exchange_posts (expires_at);
create index if not exists exchange_posts_ip_idx on public.exchange_posts (ip_hash, created_at);
alter table public.exchange_posts enable row level security;

-- 글이 지워져도 남는 통계 (글 내용·연락처 없이 종류와 시각만)
create table if not exists public.exchange_log (
  id bigint generated always as identity primary key,
  category text not null,
  action text not null check (action in ('created', 'done', 'reopened', 'deleted')),
  at timestamptz not null default now()
);
alter table public.exchange_log enable row level security;

-- 사진 저장소: 누구나 볼 수 있고, 올리기·지우기는 서버만
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('exchange-photos', 'exchange-photos', true, 1572864, array['image/webp'])
on conflict (id) do nothing;
