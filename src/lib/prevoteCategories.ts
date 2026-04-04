export type PrevoteCategoryId = "음악방송" | "시상식" | "기타";

export type PrevoteCategory = {
  id: PrevoteCategoryId;
  label: string;
  description: string;
};

export const prevoteCategories: PrevoteCategory[] = [
  {
    id: "음악방송",
    label: "음악방송",
    description: "",
  },
  {
    id: "시상식",
    label: "시상식",
    description: "",
  },
  {
    id: "기타",
    label: "기타",
    description: "",
  },
];

export function getPrevoteCategory(id: string | undefined | null) {
  if (!id) return null;
  return prevoteCategories.find((category) => category.id === id) ?? null;
}
