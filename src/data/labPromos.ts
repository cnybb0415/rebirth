import type { Localized } from "./lab";

// EXO.zip 다운로드 전 10초 동안 보여줄 투표 오픈 안내
// - opensAt: 오픈 날짜(한국 시간 기준, YYYY-MM-DD). 디데이가 자동으로 계산됨
export type LabPromo = {
  title: Localized;
  opensAt: string;
};

export const labPromos: LabPromo[] = [
  { title: { ko: "MAMA FAN’S CHOICE 2차 투표", en: "MAMA FAN’S CHOICE Round 2 Voting" }, opensAt: "2026-10-28" },
  { title: { ko: "MMA 투표", en: "MMA Voting" }, opensAt: "2026-10-30" },
];

// 안내 아래 버튼이 연결될 곳 (투표 방법 등 자세한 내용)
export const PROMO_LINK = {
  href: "https://x.com/EXOREBIRTH_STRM",
  label: { ko: "자세한 내용은 X @EXOREBIRTH_STRM", en: "Details on X @EXOREBIRTH_STRM" } satisfies Localized,
};

// 안내가 떠 있는 시간(초). 이 시간이 지나야 받기 버튼이 눌러짐
export const PROMO_SECONDS = 10;
