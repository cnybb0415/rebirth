import { PageHeader } from "@/components/PageHeader";
import { siteConfig } from "@/config/site";
import { ChartsFullPanel } from "@/components/ChartsFullPanel";
import { emptyChartsData } from "@/lib/chartsFullData";
import { readChartSnapshot } from "@/lib/chartSnapshot";

// 저장본만 읽으니 5분마다 새로 그려도 충분
export const revalidate = 300;
import { getTranslations, setRequestLocale } from "next-intl/server";


function formatKst(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
  return `${parts.year}.${parts.month}.${parts.day} ${parts.hour}:00`;
}

export default async function ChartsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("charts");
  // 저장본(매시 갱신)만 읽음
  const data = (await readChartSnapshot())?.data ?? emptyChartsData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <PageHeader
          back={{ href: "/streaming", label: t("streamingBack") }}
          title={t("title")}
          description={`${siteConfig.artistName} ${t("subtitle")}`}
          meta={
            <p className="flex items-center gap-1.5 text-xs text-foreground/45 tabular-nums">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {formatKst(data.lastUpdated)}
            </p>
          }
        />
        <div className="mt-6">
          <ChartsFullPanel data={data} />
        </div>
      </main>
    </div>
  );
}
