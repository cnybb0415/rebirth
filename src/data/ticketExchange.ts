// 콘서트 티켓 교환 게시판 설정
// - 날짜를 바꾸면 글쓰기 선택지·필터·서버 검증이 같이 바뀜
// - 공연일이 지나면(그날 밤 23:59 KST) 그 날짜 글은 목록에서 자동으로 숨김

export type ExchangeKind = "date" | "seat";
export type ContactType = "x" | "openchat";

// 날짜 표시 문구는 messages/*.json 의 exchange.dates.<id>
export type ExchangeDate = { id: string; short: string; endsAt: string };

export const EXCHANGE_DATES: ExchangeDate[] = [
  { id: "1106", short: "11.6", endsAt: "2026-11-06T23:59:59+09:00" },
  { id: "1107", short: "11.7", endsAt: "2026-11-07T23:59:59+09:00" },
  { id: "1108", short: "11.8", endsAt: "2026-11-08T23:59:59+09:00" },
];

// 탭 이름·설명·경고문은 messages/*.json 의 "exchange" 에서 관리

export const EXCHANGE_LIMITS = { seat: 40, memo: 200, contact: 120, qtyMax: 4, rows: 6 };

// 가진 티켓 한 줄 / 원하는 회차·좌석 한 줄 (+ 버튼으로 여러 줄)
export type HaveRow = { date: string; seat: string; qty: number };
export type WantRow = { date: string; seat: string };

export const isDateOpen = (d: ExchangeDate, now = Date.now()) => now <= Date.parse(d.endsAt);

// 혹시 모를 상황에 대비해 공연일로부터 7일은 DB에 보관한 뒤 삭제
export const EXCHANGE_KEEP_DAYS = 7;
export const isDatePurgeable = (d: ExchangeDate, now = Date.now()) =>
  now > Date.parse(d.endsAt) + EXCHANGE_KEEP_DAYS * 86_400_000;
export const findDate = (id: string) => EXCHANGE_DATES.find((d) => d.id === id);

// 연락처: X(트위터) 아이디 또는 카카오톡 오픈채팅 링크만
const X_HANDLE = /^@?([A-Za-z0-9_]{1,15})$/;
const OPENCHAT = /^https:\/\/open\.kakao\.com\/o\/[A-Za-z0-9_-]{4,40}$/;

export function normalizeContact(type: ContactType, raw: string): string | null {
  const v = raw.trim();
  if (type === "x") {
    const m = v.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "").replace(/\/$/, "").match(X_HANDLE);
    return m ? m[1] : null;
  }
  return OPENCHAT.test(v) ? v : null;
}

export function contactHref(type: ContactType, contact: string): string {
  return type === "x" ? `https://x.com/${contact}` : contact;
}
