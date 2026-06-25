export type StreamingCategoryId = "recommended" | "oneclick" | "links";

export type StreamingCategory = {
  id: StreamingCategoryId;
  label: string;
  description: string;
};

export const streamingCategories: StreamingCategory[] = [
  {
    id: "recommended",
    label: "권장 스트리밍 리스트",
    description: "",
  },
  {
    id: "oneclick",
    label: "원클릭 스트리밍",
    description: "",
  },
  {
    id: "links",
    label: "음원 사이트 바로가기",
    description: "",
  },
];

export function getStreamingCategory(id: string | undefined | null) {
  if (!id) return null;
  return streamingCategories.find((category) => category.id === id) ?? null;
}
