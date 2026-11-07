import { setRequestLocale } from "next-intl/server";
import { isDiaryOpen } from "@/data/diary";
import { EncoreMenuClient } from "./EncoreMenuClient";
import { DiaryClient } from "@/components/concert/diary/DiaryClient";

// 전환 시점(11/8 21:00 KST)을 지나면 1분 내에 다이어리로 바뀌도록
export const revalidate = 60;

export default async function EncorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (isDiaryOpen()) return <DiaryClient />;
  return <EncoreMenuClient />;
}
