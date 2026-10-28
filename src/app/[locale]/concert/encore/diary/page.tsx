import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { DiaryClient } from "@/components/concert/diary/DiaryClient";

// 전환일(11/8 21:00 KST) 전에도 다이어리를 확인하기 위한 미리보기 경로
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DiaryPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DiaryClient />;
}
