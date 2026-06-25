"use client";

import type { ChartsData } from "@/lib/charts";
import { cn } from "@/lib/utils";
import { MusicServiceIcon, resolveMusicServiceIdFromLabel } from "@/components/MusicServiceIcon";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type ProviderKey = "melon" | "genie" | "bugs" | "flo" | "vibe" | "other" | "all";

type ProviderMeta = {
  key: Exclude<ProviderKey, "all">;
  label: string;
  color: string;
};

const PROVIDERS: ProviderMeta[] = [
  { key: "melon", label: "멜론", color: "#00CF2A" },
  { key: "genie", label: "지니", color: "#0094FF" },
  { key: "bugs", label: "벅스", color: "#FF4C2C" },
  { key: "flo", label: "플로", color: "#3F3FF8" },
  { key: "vibe", label: "바이브", color: "#F35181" },
];

function getProviderKey(label: string): Exclude<ProviderKey, "all"> {
  const text = label.trim();
  if (text.includes("멜론")) return "melon";
  if (text.includes("지니")) return "genie";
  if (text.includes("벅스")) return "bugs";
  if (text.includes("플로")) return "flo";
  if (text.includes("바이브")) return "vibe";
  return "other";
}

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

function getRankChangeLabel(rank?: number, prevRank?: number): string {
  if (typeof rank !== "number") return "-";
  if (typeof prevRank !== "number") return "-";
  if (prevRank === rank) return "-";
  if (prevRank > rank) return `↑${prevRank - rank}`;
  return `↓${rank - prevRank}`;
}

function getRankChangeColor(changeLabel: string): string {
  if (changeLabel === "-") return "text-neutral-400";
  if (changeLabel.startsWith("↑")) return "text-red-500";
  if (changeLabel.startsWith("↓")) return "text-blue-500";
  return "text-neutral-400";
}

function ProviderPill({
  label,
  isActive,
  color,
  onClick,
}: {
  label: string;
  isActive: boolean;
  color: string;
  onClick: () => void;
}) {
  const serviceId = resolveMusicServiceIdFromLabel(label);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs sm:text-sm",
        "transition-colors",
        isActive
          ? "border-transparent text-white"
          : "border-gray-200 bg-white text-neutral-700 hover:bg-gray-50"
      )}
      style={isActive ? { backgroundColor: color } : undefined}
    >
      {serviceId ? (
        <span className="inline-flex h-4 w-4 items-center justify-center" aria-hidden>
          <MusicServiceIcon service={serviceId} label={label} size={16} className="h-4 w-4" />
        </span>
      ) : (
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            isActive ? "bg-white/90" : "bg-neutral-300"
          )}
          style={!isActive ? { backgroundColor: color } : undefined}
          aria-hidden
        />
      )}
      <span className="leading-none">{label}</span>
    </button>
  );
}

export function ChartsPanel({ charts }: { charts: ChartsData }) {
  const t = useTranslations("charts");
  const grouped = useMemo(() => {
    const byProvider = new Map<Exclude<ProviderKey, "all">, ChartsData["items"]>();
    for (const item of charts.items) {
      const key = getProviderKey(item.label);
      const existing = byProvider.get(key) ?? [];
      existing.push(item);
      byProvider.set(key, existing);
    }
    return byProvider;
  }, [charts.items]);

  const availableProviders = useMemo(() => {
    const keys = new Set(grouped.keys());
    return PROVIDERS.filter((p) => keys.has(p.key));
  }, [grouped]);

  const defaultKey: ProviderKey = availableProviders[0]?.key ?? "all";
  const [active, setActive] = useState<ProviderKey>(defaultKey);

  const rows = useMemo(() => {
    if (active === "all") return charts.items;
    return grouped.get(active) ?? [];
  }, [active, charts.items, grouped]);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs text-neutral-400">
          {t("updatedLabel")} {formatKstTimestampTopOfHour(charts.lastUpdated)} KST
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        <ProviderPill
          label={t("all")}
          isActive={active === "all"}
          color="#111827"
          onClick={() => setActive("all")}
        />
        {availableProviders.map((p) => (
          <ProviderPill
            key={p.key}
            label={p.label}
            isActive={active === p.key}
            color={p.color}
            onClick={() => setActive(p.key)}
          />
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-neutral-100">
        <div className="flex items-center text-xs text-neutral-400 h-10 border-b border-neutral-100 bg-neutral-50">
          <p className="w-12 text-center">{t("rank")}</p>
          <div className="flex-1 px-3">{t("chartCol")}</div>
          <p className="w-14 text-center">{t("change")}</p>
        </div>

        {rows.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-neutral-500">
            {t("noData")}
          </div>
        ) : (
          rows.map((item) => {
            const rankText = typeof item.rank === "number" ? String(item.rank) : "-";
            const changeLabel = getRankChangeLabel(item.rank, item.prevRank);

            const statusText =
              typeof item.rank === "number"
                ? null
                : (item.status ?? t("noData")).trim();

            return (
              <div
                key={item.label}
                className="flex items-center border-b border-neutral-100 py-3 last:border-b-0"
              >
                <div className="w-12 text-center">
                  <p className="text-sm font-bold tabular-nums">{rankText}</p>
                </div>

                <div className="flex-1 px-3">
                  <p className="text-sm font-semibold">{item.label}</p>
                  {statusText ? (
                    <p className="mt-0.5 text-xs text-neutral-400">{statusText}</p>
                  ) : null}
                </div>

                <div className="w-14 text-center">
                  <p
                    className={cn(
                      "text-xs font-semibold tabular-nums",
                      getRankChangeColor(changeLabel)
                    )}
                  >
                    {changeLabel}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
