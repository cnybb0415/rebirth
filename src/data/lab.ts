// EXO 실험실 — 팬 제작 자료 목록. 파일은 public/file/lab 에 둠

// 한국어 페이지만 한국어, 나머지(en/zh/ja)는 영어로 보여줌
export type LabLang = "ko" | "en";
export const labLang = (locale: string): LabLang => (locale === "ko" ? "ko" : "en");
export type Localized = Record<LabLang, string>;

export type LabItem = {
  slug: string;
  title: string;
  summary: Localized;
  tags: Record<LabLang, string[]>;
  file: { href: string; name: string; size: string };
  updated: string;
};

export const labItems: LabItem[] = [
  {
    slug: "exo-mungchiz",
    title: "EXO-MUNGCHIZ ChatGPT Pet",
    summary: { ko: "EXO-MUNGCHIZ 와 같이 놀기!", en: "Hang out with EXO-MUNGCHIZ!" },
    tags: { ko: ["ChatGPT", "펫", "Windows", "Mac"], en: ["ChatGPT", "Pet", "Windows", "Mac"] },
    file: { href: "/file/lab/exo-mungchiz.zip", name: "exo-mungchiz.zip", size: "14MB" },
    updated: "2026.10.24",
  },
];

export type PetMember = { id: string; name: string };

// 스프라이트 시트: public/images/lab/exo-mungchiz/{id}.webp (원본의 절반 크기, 한 칸 96×104)
export const mungchizMembers: PetMember[] = [
  { id: "suho", name: "SUHO" },
  { id: "lay", name: "LAY" },
  { id: "chanyeol", name: "CHANYEOL" },
  { id: "do", name: "D.O." },
  { id: "kai", name: "KAI" },
  { id: "sehun", name: "SEHUN" },
];

export type PetMotion = {
  id: string;
  /** 시트의 몇 번째 줄인지(0부터) */
  row: number;
  frames: number;
  /** 한 컷당 시간(ms) */
  frameMs: number;
  label: Localized;
  when: Localized;
};

export const petMotions: PetMotion[] = [
  {
    id: "idle", row: 0, frames: 6, frameMs: 170,
    label: { ko: "가만히", en: "Idle" },
    when: { ko: "가만히 있을 때 · 정면으로 서서 눈 깜빡", en: "When idle · faces forward and blinks" },
  },
  {
    id: "running-right", row: 1, frames: 8, frameMs: 100,
    label: { ko: "걷기", en: "Walk" },
    when: { ko: "화면에서 움직일 때 · 옆모습으로 걷기", en: "When moving across the screen · walks sideways" },
  },
  {
    id: "waving", row: 3, frames: 4, frameMs: 160,
    label: { ko: "손 흔들기", en: "Wave" },
    when: { ko: "인사할 때", en: "When saying hi" },
  },
  {
    id: "jumping", row: 4, frames: 5, frameMs: 130,
    label: { ko: "점프", en: "Jump" },
    when: { ko: "기분 좋을 때", en: "When happy" },
  },
  {
    id: "failed", row: 5, frames: 8, frameMs: 140,
    label: { ko: "실패", en: "Fail" },
    when: { ko: "작업이 실패했을 때 · 엎드리기 / 울기", en: "When a task fails · lies down / cries" },
  },
  {
    id: "waiting", row: 6, frames: 6, frameMs: 180,
    label: { ko: "기다림", en: "Wait" },
    when: { ko: "내 입력을 기다릴 때 · 앉아서 기다리기", en: "When waiting for your input · sits and waits" },
  },
  {
    id: "running", row: 7, frames: 6, frameMs: 140,
    label: { ko: "열일", en: "Working" },
    when: { ko: "ChatGPT가 작업 중일 때 · 뒤돌아서 열일", en: "While ChatGPT is working · turns around and gets to work" },
  },
  {
    id: "review", row: 8, frames: 6, frameMs: 170,
    label: { ko: "검토", en: "Review" },
    when: { ko: "결과를 검토할 때 · 고개 갸웃", en: "When reviewing results · tilts its head" },
  },
];
