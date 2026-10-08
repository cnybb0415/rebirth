import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SingAlongClient } from "./SingAlongClient";

// QR코드 전용 페이지 — 메뉴/네비게이션 어디에도 링크하지 않음
const DAY_SONGS: Record<string, { id: string; title: string }> = {
  day1: { id: "tender_love", title: "TENDER LOVE" },
  day2: { id: "girlxfriend", title: "Girl x Friend" },
  day3: { id: "발자국", title: "발자국(On the snow)" },
};

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SingAlongDayPage({
  params,
}: {
  params: Promise<{ locale: string; day: string }>;
}) {
  const { locale, day } = await params;
  setRequestLocale(locale);

  const song = DAY_SONGS[day];
  if (!song) notFound();

  return <SingAlongClient songId={song.id} title={song.title} initialLocale={locale} />;
}
