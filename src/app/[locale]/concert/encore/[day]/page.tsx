import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { singAlongDays } from "@/data/singAlongDays";
import { SingAlongClient } from "./SingAlongClient";

// QR코드 전용 페이지 — 메뉴/네비게이션 어디에도 링크하지 않음

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

  const match = day.match(/^day([1-3])$/);
  const song = match ? singAlongDays.find((d) => d.day === Number(match[1])) : undefined;
  if (!song) notFound();

  return <SingAlongClient songId={song.songId} title={song.title} initialLocale={locale} />;
}
