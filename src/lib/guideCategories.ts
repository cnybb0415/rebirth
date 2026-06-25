export type GuideCategoryId = "streaming" | "download" | "signup" | "gift" | "mv" | "prevote";

export type GuideCategory = {
  id: GuideCategoryId;
  label: string;
  description: string;
};

export const guideCategories: GuideCategory[] = [
  {
    id: "streaming",
    label: "스트리밍",
    description: "",
  },
  {
    id: "download",
    label: "다운로드",
    description: "",
  },
  {
    id: "signup",
    label: "아이디 생성",
    description: "",
  },
  {
    id: "gift",
    label: "선물하기",
    description: "",
  },
  {
    id: "mv",
    label: "뮤직비디오",
    description: "",
  },
  {
    id: "prevote",
    label: "투표 가이드",
    description: "",
  },
];

export function getGuideCategory(id: string | undefined | null) {
  if (!id) return null;
  return guideCategories.find((category) => category.id === id) ?? null;
}
