-- 글 비밀번호(숫자 6자리) 무차별 대입 방지: 틀린 횟수와 잠금 시각
alter table public.ticket_exchanges
  add column if not exists pw_fail_count smallint not null default 0,
  add column if not exists pw_locked_until timestamptz;
