import { Link } from "@/i18n/navigation";
import type { ChartItem, ChartsData } from "@/lib/charts";
import { cn } from "@/lib/utils";
import { MusicServiceIcon } from "@/components/MusicServiceIcon";
import { getTranslations } from "next-intl/server";

type ProviderKey = "melon" | "genie" | "bugs" | "flo" | "vibe";

type CardDef = {
  id: string;
  provider: ProviderKey;
  providerLabel: string;
  typeLabel: string;
  matchLabels: string[];
};

const CARDS: CardDef[] = [
  {
    id: "melon_top100",
    provider: "melon",
    providerLabel: "멜론",
    typeLabel: "TOP100",
    matchLabels: ["멜론 TOP100"],
  },
  {
    id: "melon_hot100_100d",
    provider: "melon",
    providerLabel: "멜론",
    typeLabel: "HOT100 100일",
    matchLabels: ["멜론 HOT100 100일"],
  },
  {
    id: "melon_hot100_30d",
    provider: "melon",
    providerLabel: "멜론",
    typeLabel: "HOT100 30일",
    matchLabels: ["멜론 HOT100 30일"],
  },
  {
    id: "genie_top200",
    provider: "genie",
    providerLabel: "지니",
    typeLabel: "TOP200 (실시간)",
    matchLabels: ["지니", "지니 TOP200"],
  },
  {
    id: "bugs_realtime",
    provider: "bugs",
    providerLabel: "벅스",
    typeLabel: "실시간",
    matchLabels: ["벅스", "벅스 실시간"],
  },
  {
    id: "flo_realtime",
    provider: "flo",
    providerLabel: "플로",
    typeLabel: "실시간",
    matchLabels: ["플로", "플로 실시간"],
  },
  {
    id: "vibe_domestic",
    provider: "vibe",
    providerLabel: "바이브",
    typeLabel: "국내 급상승",
    matchLabels: ["바이브 국내 급상승"],
  },
  {
    id: "vibe_today_top100",
    provider: "vibe",
    providerLabel: "바이브",
    typeLabel: "오늘 TOP100",
    matchLabels: ["바이브 오늘 TOP100"],
  },
];

function formatKstTimestampTopOfHour(iso: string): string {
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

function findItem(items: ChartItem[], matchLabels: string[]): ChartItem | undefined {
  return items.find((item) => matchLabels.some((label) => item.label.includes(label)));
}

function getRankText(item?: ChartItem, rankSuffix?: string): { primary: string; suffix?: string } {
  if (typeof item?.rank === "number") return { primary: String(item.rank), suffix: rankSuffix };
  if (typeof item?.status === "string" && item.status.trim().length > 0) {
    return { primary: item.status.trim() };
  }
  return { primary: "-" };
}

function getChange(
  rank?: number,
  prevRank?: number,
  rankStatus?: string,
  changedRank?: number
): { label: string; className: string } {
  if (typeof rank !== "number") return { label: "-", className: "text-neutral-400" };

  const status = typeof rankStatus === "string" ? rankStatus.toLowerCase() : "";
  const delta = typeof changedRank === "number" ? changedRank : undefined;

  if (status === "up" && typeof delta === "number") {
    return { label: `↑${delta}`, className: "text-red-500" };
  }
  if (status === "down" && typeof delta === "number") {
    return { label: `↓${delta}`, className: "text-blue-500" };
  }
  if (status === "new") {
    return { label: "NEW", className: "text-emerald-500" };
  }
  if (status === "static") {
    return { label: "-", className: "text-neutral-400" };
  }

  if (typeof prevRank !== "number" || prevRank === rank) {
    return { label: "-", className: "text-neutral-400" };
  }

  // Smaller rank is better. (ex: 10 -> 8 means ↑2)
  if (prevRank > rank) {
    return { label: `↑${prevRank - rank}`, className: "text-red-500" };
  }
  return { label: `↓${rank - prevRank}`, className: "text-blue-500" };
}

function renderTypeLabel(typeLabel: string) {
  const hotMatch = typeLabel.match(/^HOT100\s+(100일|30일)$/);
  if (hotMatch) {
    const day = hotMatch[1];
    return (
      <span>
        HOT100 <span className="text-[10px] font-semibold text-neutral-400">({day})</span>
      </span>
    );
  }

  const realtimeMatch = typeLabel.match(/^(.*)\s+\((실시간)\)$/);
  if (realtimeMatch) {
    const base = realtimeMatch[1].trim();
    const suffix = realtimeMatch[2];
    return (
      <span>
        {base} <span className="text-[10px] font-semibold text-neutral-400">({suffix})</span>
      </span>
    );
  }

  return <span>{typeLabel}</span>;
}

function ProviderIcon({ provider, label }: { provider: ProviderKey; label: string }) {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm border border-foreground/10 sm:h-8 sm:w-8">
      <MusicServiceIcon service={provider} label={label} size={16} className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
    </span>
  );
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="text-neutral-400"
    >
      <path
        d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 6v6l4 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export async function ChartSummaryGrid({
  trackTitle,
  charts,
  moreHref,
}: {
  trackTitle: string;
  charts: ChartsData;
  moreHref?: string;
}) {
  const t = await getTranslations("charts");
  const safeTitle = trackTitle?.trim().length ? trackTitle.trim() : t("title");
  const updated = formatKstTimestampTopOfHour(charts.lastUpdated);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            <span className="font-bold">{safeTitle}</span>{t("chartOf")}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
            <ClockIcon />
            <span className="tabular-nums">{updated}</span>
          </div>
        </div>
        {moreHref ? (
          <Link
            href={moreHref}
            className="text-xs font-medium text-foreground/50 hover:text-foreground whitespace-nowrap pt-1"
          >
            {t("moreCharts")}
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-1.5 sm:gap-4">
        {CARDS.map((card) => {
          const item = findItem(charts.items, card.matchLabels);
          const rankSuffix = t("rankSuffix");
          const rankText = getRankText(item, rankSuffix || undefined);
          const change = getChange(item?.rank, item?.prevRank, item?.rankStatus, item?.changedRank);

          return (
            <div
              key={card.id}
              className={cn(
                "rounded-xl border border-foreground/10 bg-white px-2.5 py-2.5 shadow-sm sm:rounded-2xl sm:px-5 sm:py-4",
                "transition-colors hover:border-sky-300"
              )}
            >
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                  <ProviderIcon provider={card.provider} label={card.providerLabel} />
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-sm font-bold leading-tight break-keep">
                      {card.providerLabel}
                    </p>
                    <p className="mt-0.5 sm:mt-1 text-[9.5px] sm:text-xs text-neutral-500 leading-tight break-keep">
                      {renderTypeLabel(card.typeLabel)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[12px] sm:text-xl font-extrabold tabular-nums leading-none">
                    {rankText.suffix ? (
                      <span className="inline-flex items-baseline gap-0.5">
                        <span>{rankText.primary}</span>
                        <span className="text-[8px] sm:text-sm font-bold">
                          {rankText.suffix}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[8px] sm:text-sm font-semibold text-neutral-500 whitespace-nowrap">
                        {rankText.primary}
                      </span>
                    )}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 sm:mt-1 text-[9.5px] sm:text-xs font-semibold tabular-nums",
                      change.className
                    )}
                  >
                    {change.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
