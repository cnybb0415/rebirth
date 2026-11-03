-- (선택) DB에서 매일 03:00 KST 에 정리하고 싶을 때만 Supabase SQL 편집기에서 실행
-- 사이트 코드(src/lib/exchangeDb.ts purgeExpiredExchanges)는 게시판이 열릴 때 같은 정리를 함.
-- 이 예약 작업은 아무도 게시판을 열지 않아도 지워지게 해 줌.
create extension if not exists pg_cron;

create or replace function public.purge_ticket_exchanges() returns void
language sql
security definer
set search_path = public
as $$
  delete from public.ticket_exchanges t
  where (
    select max(to_date(extract(year from t.created_at at time zone 'Asia/Seoul')::text || d, 'YYYYMMDD'))
    from unnest(t.have_dates || t.want_dates) as d
  ) < (now() at time zone 'Asia/Seoul')::date - 7;
$$;

revoke all on function public.purge_ticket_exchanges() from public, anon, authenticated;

select cron.schedule('purge-ticket-exchanges', '0 18 * * *', 'select public.purge_ticket_exchanges();');
