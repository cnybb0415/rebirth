// 콘서트 티켓 교환 게시판 설정
// - 날짜를 바꾸면 글쓰기 선택지·필터·서버 검증이 같이 바뀜
// - 공연일이 지나면(그날 밤 23:59 KST) 그 날짜 글은 목록에서 자동으로 숨김

export type ExchangeKind = "date" | "seat";
export type ContactType = "x" | "openchat";

export type ExchangeDate = { id: string; label: string; short: string; endsAt: string };

export const EXCHANGE_DATES: ExchangeDate[] = [
  { id: "1106", label: "11월 6일(금)", short: "11.6", endsAt: "2026-11-06T23:59:59+09:00" },
  { id: "1107", label: "11월 7일(토)", short: "11.7", endsAt: "2026-11-07T23:59:59+09:00" },
  { id: "1108", label: "11월 8일(일)", short: "11.8", endsAt: "2026-11-08T23:59:59+09:00" },
];

export const EXCHANGE_KINDS: { id: ExchangeKind; label: string; desc: string }[] = [
  { id: "date", label: "날짜 교환", desc: "가진 날짜 티켓을 다른 날짜 티켓으로 교환합니다" },
  { id: "seat", label: "좌석 교환", desc: "같은 날짜 안에서 다른 구역 티켓으로 교환합니다" },
];

export const EXCHANGE_NOTICE_TITLE = "거래 전 꼭 읽어 주십시오";

export const EXCHANGE_NOTICE = [
  "이 게시판은 교환 글을 모아 보여 주는 공간입니다. 게시판을 통해 이루어지는 개인 간 거래에서 발생하는 문제에 대해 EXO RE:BIRTH는 책임지지 않습니다.",
  "예매 내역 등으로 본인 확인이 된 사람과만 거래를 진행하시기 바랍니다.",
  "티켓은 공연 당일 현장에서 서로 직접 확인한 뒤 교환하시기 바랍니다. 선입금이나 티켓 선발송을 요구하면 거래하지 마십시오.",
  "교환 글만 올려 주시기 바랍니다. 판매·양도·웃돈 거래 글은 삭제됩니다.",
  "글을 쓸 때 정한 비밀번호로 '교환 완료' 표시와 삭제를 할 수 있습니다.",
];

export const EXCHANGE_LIMITS = { seat: 40, memo: 200, contact: 120, qtyMax: 4 };

export const isDateOpen = (d: ExchangeDate, now = Date.now()) => now <= Date.parse(d.endsAt);
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
