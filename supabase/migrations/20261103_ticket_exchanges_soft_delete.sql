-- 작성자가 삭제한 글: 바로 지우지 않고 deleted_at만 기록해 목록에서 숨김
-- 실제 삭제는 공연 종료 7일 뒤 purgeExpiredExchanges가 다른 글과 함께 처리
alter table public.ticket_exchanges add column if not exists deleted_at timestamptz;
