import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ChartsFullPanel } from "@/components/ChartsFullPanel";
import { fetchFullChartsData } from "@/lib/chartsFullData";

export const revalidate = 3600;

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

export default async function ChartsPage() {
  const data = await fetchFullChartsData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">음원 순위</h1>
            <p className="mt-1 text-sm text-foreground/60">{siteConfig.artistName} 실시간 차트</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-400 tabular-nums">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {formatKst(data.lastUpdated)}
            </p>
          </div>
          <Link
            href="/streaming"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground pb-0.5"
          >
            <span aria-hidden>‹</span> 스트리밍 목록
          </Link>
        </div>
        <div className="mt-6 rounded-2xl border border-foreground/10 bg-white p-5 shadow-sm">
          <ChartsFullPanel data={data} />
        </div>
      </main>
    </div>
  );
}
