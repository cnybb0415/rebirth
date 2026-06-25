// 클라이언트/서버 양쪽에서 import 가능한 순수 타입·상수
// (Node.js 전용 모듈 없음)

export type CheeringSongAsset = {
  type: "image";
  src: string;
  alt: string;
};

export type LangKey = "ko" | "en" | "cn" | "jp";

export const LANG_LABELS: Record<LangKey, string> = {
  ko: "한국어",
  en: "ENGLISH",
  cn: "中文",
  jp: "日本語",
};
