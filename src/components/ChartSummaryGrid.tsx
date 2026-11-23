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
    id: "melon_daily",
    provider: "melon",
    providerLabel: "멜론",
    typeLabel: "일간",
    matchLabels: ["멜론 일간"],
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
    id: "genie_daily",
    provider: "genie",
    providerLabel: "지니",
    typeLabel: "일간",
    matchLabels: ["지니 일간"],
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
    typeLabel: "급상승",
    matchLabels: ["바이브 급상승", "바이브 국내 급상승"],
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
  return items.find((item) => matchLabels.includes(item.label));
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

function ProviderIcon({ provider, label }: { provider: ProviderKey; label: string }) {
  return (
    <span className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#fff]">
      <MusicServiceIcon service={provider} label={label} size={18} className="h-[18px] w-[18px]" />
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
  bare = false,
}: {
  trackTitle: string;
  charts: ChartsData;
  moreHref?: string;
  /** 제목 없이 목록만 (홈 카드 안) */
  bare?: boolean;
}) {
  const t = await getTranslations("charts");
  const safeTitle = trackTitle?.trim().length ? trackTitle.trim() : t("title");
  const updated = formatKstTimestampTopOfHour(charts.lastUpdated);
  const rows = CARDS.map((card) => ({ card, item: findItem(charts.items, card.matchLabels) }));
  const charted = rows.filter((r) => typeof r.item?.rank === "number");
  const uncharted = rows.filter((r) => typeof r.item?.rank !== "number");

  return (
    <div>
      {bare ? null : (
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
      )}

      <div className={cn("flex flex-col gap-2", !bare && "mt-4")}>
        {charted.map(({ card, item }) => {
          const rankText = getRankText(item, t("rankSuffix") || undefined);
          const change = getChange(item?.rank, item?.prevRank, item?.rankStatus, item?.changedRank);
          return (
            <div key={card.id} className="flex items-center gap-2.5 rounded-xl bg-foreground/5 px-3 py-2.5 text-[13px]">
              <ProviderIcon provider={card.provider} label={card.providerLabel} />
              <div className="min-w-0 flex-1">
                <p className="leading-tight">
                  {card.providerLabel} <span className="text-[11px] text-foreground/50">{card.typeLabel}</span>
                </p>
                {item?.title ? (
                  <p className="mt-0.5 truncate text-[10px] text-foreground/50">
                    {item.title}
                    {item.count && item.count > 1 ? <span> +{item.count - 1}</span> : null}
                  </p>
                ) : null}
              </div>
              <span className={cn("text-[10px] font-semibold tabular-nums", change.className)}>{change.label}</span>
              <span className="font-display min-w-[36px] text-right text-[22px] leading-none tabular-nums">
                {rankText.primary}
              </span>
            </div>
          );
        })}
        {charted.length === 0 ? (
          <div className="rounded-xl bg-foreground/5 px-3 py-4 text-center text-sm text-foreground/50">{t("notCharted")}</div>
        ) : null}
        {uncharted.length > 0 ? (
          <p className="px-1 pt-1 text-[11px] leading-relaxed text-foreground/45">
            {t("notCharted")} · {uncharted.map(({ card }) => `${card.providerLabel} ${card.typeLabel}`).join(", ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
