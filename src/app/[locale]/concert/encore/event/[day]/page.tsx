import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

// QR코드 전용 페이지(슬로건 뒷면 이벤트 안내, 중국어·일본어) — 메뉴/네비게이션 어디에도 링크하지 않음
const GUIDE_DIR = "/images/concert/encore/QR";
const GUIDES: Record<string, string> = {
  day1: "슬로건 1일차 중&일 뒷면.png",
  day2: "슬로건 2일차 중&일 뒷면.png",
  day3: "슬로건 3일차 중&일 뒷면.png",
};

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function EventGuidePage({
  params,
}: {
  params: Promise<{ locale: string; day: string }>;
}) {
  const { locale, day } = await params;
  setRequestLocale(locale);

  const file = GUIDES[day];
  if (!file) notFound();
  const dayNum = day.replace("day", "");

  return (
    <>
      {/* concert 레이아웃의 어두운 배경을 흰색으로 덮음 */}
      <div className="fixed inset-0 bg-background" aria-hidden />
      <main className="relative mx-auto w-full max-w-5xl px-3 py-8 sm:px-6 sm:py-10">
        <div className="mb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40">Event Guide</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">DAY {dayNum}</h1>
        </div>
        <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${GUIDE_DIR}/${encodeURIComponent(file)}`}
            alt={`EXO PLANET #6 DAY ${dayNum} 이벤트 안내 (中文 / 日本語)`}
            width={1600}
            height={900}
            className="block h-auto w-full"
          />
        </div>
      </main>
    </>
  );
}
