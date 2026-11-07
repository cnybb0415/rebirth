// 카드섹션 공개 시각 — 한국시간(KST, +09:00) 기준, 서버 시계로 판단
export const CARD_DAYS = [
  { id: "1107", openAt: "2026-11-07T16:10:00+09:00", endsAt: "2026-11-07T23:59:59+09:00" },
  { id: "1108", openAt: "2026-11-08T15:10:00+09:00", endsAt: "2026-11-08T23:59:59+09:00" },
] as const;

export const FIRST_OPEN_AT = CARD_DAYS[0].openAt;
