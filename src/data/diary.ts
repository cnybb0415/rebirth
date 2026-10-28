// 콘서트 종료 후 encore 페이지를 다이어리로 전환하는 시점
// 2026-11-08 21:00 KST (= 12:00 UTC)
export const DIARY_START = new Date("2026-11-08T12:00:00Z");

export function isDiaryOpen(now: Date = new Date()): boolean {
  return now >= DIARY_START;
}

export type DiaryPage = {
  id: string;
  src: string;
  alt: string;
};

const DIR = "/images/concert/encore/diary";

// 가로 화면: 펼침면(양면) 3장. 글씨는 이미지에 포함되어 있음
export const diarySpreads: DiaryPage[] = [
  {
    id: "afternoon",
    src: `${DIR}/page1.webp`,
    alt: "EVERYONE'S OUT SOMEWHERE : DIFFERENT CARS, DIFFERENT PLANS / SPEND THE AFTERNOON WHEREVER YOU WANT",
  },
  {
    id: "night",
    src: `${DIR}/page2.webp`,
    alt: "HOME BY NIGHT : SOMEWHERE TO GO, SOMEWHERE TO COME BACK TO / NIGHT STARTS WHEN EVERYONE ARRIVES",
  },
  {
    id: "letter",
    src: `${DIR}/page3.webp`,
    alt: "EXO 사진과 손편지가 붙은 다이어리",
  },
];

// 세로 화면: 한 장씩 4장. spread는 같은 내용의 가로 펼침면 번호(화면을 돌려도 이어 보도록)
export const diaryPagesMobile: (DiaryPage & { spread: number })[] = [
  { ...diarySpreads[0], src: `${DIR}/page1_mo.webp`, spread: 0 },
  { ...diarySpreads[1], src: `${DIR}/page2_mo.webp`, spread: 1 },
  { id: "photo", src: `${DIR}/page3_1_mo.webp`, alt: "EXO 사진이 붙은 다이어리", spread: 2 },
  { id: "letter", src: `${DIR}/page3_2_mo.webp`, alt: "KAI 손편지가 붙은 다이어리", spread: 2 },
];

// 첫 장에서 이 시간만큼 머문 뒤 두 번째 장으로 자동으로 넘어감 (이후는 수동)
export const AUTO_FLIP_AFTER_MS = 5000;
