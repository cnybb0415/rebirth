// 교환 게시판 설정 — 포토카드 · 굿즈 · 티켓 · 기타
// 문구는 messages/*.json 의 "exchange"

export type ExchangeCategory = "photocard" | "goods" | "ticket" | "etc";
export const EXCHANGE_CATEGORIES: ExchangeCategory[] = ["photocard", "goods", "ticket", "etc"];
// 사진을 붙일 수 있는 종류 (티켓은 바코드·예매번호가 찍힐 수 있어서 사진 없음)
export const PHOTO_CATEGORIES: ExchangeCategory[] = ["photocard", "goods", "etc"];
export const isCategory = (v: unknown): v is ExchangeCategory =>
  typeof v === "string" && (EXCHANGE_CATEGORIES as string[]).includes(v);

export type ContactType = "x" | "openchat";

// 포토카드·굿즈·기타: 물건 이름 한 줄
export type ItemRow = { text: string };
// 티켓: 날짜(YYYY-MM-DD) + 좌석 + 매수. 원하는 쪽은 날짜·좌석 비워도 됨(무관)
export type TicketHave = { date: string; seat: string; qty: number };
export type TicketWant = { date: string; seat: string };

export const EXCHANGE_LIMITS = {
  item: 60,
  seat: 40,
  event: 60,
  etcLabel: 30,
  memo: 300,
  contact: 120,
  rows: 8,
  qtyMax: 4,
  photos: 4,
  photoBytes: 1.5 * 1024 * 1024, // 서버에서 다시 줄인 뒤 크기
  uploadBytes: 4 * 1024 * 1024, // 올릴 때 받는 최대 크기
};

// 자동 삭제: 티켓은 마지막 공연일 7일 뒤, 나머지는 올린 지 30일 뒤
export const KEEP_AFTER_SHOW_DAYS = 7;
export const KEEP_ITEM_DAYS = 30;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const kstToday = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
const addDays = (ymd: string, n: number) => {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// 오늘(한국 시간)부터 1년 안의 날짜만
export function isShowDate(v: unknown): v is string {
  if (typeof v !== "string" || !DATE.test(v) || Number.isNaN(Date.parse(`${v}T00:00:00Z`))) return false;
  const today = kstToday();
  return v >= today && v <= addDays(today, 366);
}
export const minShowDate = () => kstToday();
export const maxShowDate = () => addDays(kstToday(), 366);

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

// 돈이 오가는 거래 표현 — 어느 칸에 있어도 글 등록을 막음 (교환만 가능)
export const MONEY_PATTERN =
  /추\s*금|추가\s*(금|비용|요금)|웃\s*돈|웃금|ㅊㄱ|프리미엄|차액|사례금|\+\s*\d+\s*(만|천|원|k)|\d+\s*(만\s*원|천\s*원|원)|\d+\s*(₩|￦)|(₩|￦)\s*\d|판매(?!\s*처)|팝니다|팔아요|팔게요|구매(?!\s*(특전|처|자))|삽니다|사요|살게요|구해요\s*\d|양도|입금|계좌|송금|택포|정가|원가|가격|금액|premium|extra\s*(pay|money|cash)|for\s*sale|selling|\bWTS\b|\bWTB\b|\bpay(pal)?\b|追加料金|上乗せ|プレミア|販売|譲渡|売ります|買います|加钱|加價|加价|补差价|補差價|出售|收购|转让|轉讓/i;
export const hasMoney = (s: string | null | undefined) => !!s && MONEY_PATTERN.test(s);
