"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MusicServiceIcon, resolveMusicServiceIdFromLabel } from "@/components/MusicServiceIcon";
import type { FullChartsData, FullChartEntry, ChartSection } from "@/lib/chartsFullData";
import { useTranslations } from "next-intl";

export type { FullChartsData };

const PROVIDER_COLORS: Record<string, string> = {
  melon: "#00CF2A",
  genie: "#0094FF",
  bugs: "#FF4C2C",
  flo: "#3F3FF8",
  vibe: "#F35181",
};

function getRankChangeLabel(rankStatus?: string, changedRank?: number): string {
  if (!rankStatus) return "-";
  const s = rankStatus.toLowerCase();
  if (s === "new") return "NEW";
  if (s === "static") return "-";
  if (s === "up" && typeof changedRank === "number") return `↑${changedRank}`;
  if (s === "down" && typeof changedRank === "number") return `↓${changedRank}`;
  return "-";
}

function getRankChangeColor(label: string): string {
  if (label === "-") return "text-neutral-400";
  if (label === "NEW") return "text-emerald-500";
  if (label.startsWith("↑")) return "text-red-500";
  if (label.startsWith("↓")) return "text-blue-500";
  return "text-neutral-400";
}

function dedupeArtist(artist: string): string {
  const parts = artist.split(",").map((s) => s.trim()).filter(Boolean);
  return [...new Set(parts)].join(", ");
}

function ChartRow({ entry }: { entry: FullChartEntry }) {
  const changeLabel = getRankChangeLabel(entry.rankStatus, entry.changedRank);
  return (
    <div className="flex items-center border-b border-neutral-100 py-2.5 last:border-b-0">
      <div className="w-10 text-center shrink-0">
        <p className="text-sm font-bold tabular-nums">{entry.rank}</p>
      </div>
      {entry.albumArt ? (
        <div className="shrink-0 px-2">
          <img
            src={entry.albumArt}
            alt=""
            className="h-10 w-10 rounded object-cover"
            loading="lazy"
          />
        </div>
      ) : null}
      <div className="flex-1 px-2 min-w-0">
        <p className="text-sm font-semibold truncate">{entry.title}</p>
        <p className="mt-0.5 text-xs text-neutral-400 truncate">{dedupeArtist(entry.artist)}</p>
      </div>
      <div className="w-12 text-center">
        <p className={cn("text-xs font-semibold tabular-nums", getRankChangeColor(changeLabel))}>
          {changeLabel}
        </p>
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  providerKey,
  providerLabel,
}: {
  section: ChartSection;
  providerKey: string;
  providerLabel: string;
}) {
  const t = useTranslations("charts");
  const serviceId = resolveMusicServiceIdFromLabel(providerLabel);
  const color = PROVIDER_COLORS[providerKey] ?? "#111827";

  return (
    <div className="mt-5 first:mt-0">
      <div className="mb-2 flex items-center gap-1.5">
        {serviceId ? (
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: color + "22" }}
            aria-hidden
          >
            <MusicServiceIcon service={serviceId} label={providerLabel} size={13} className="h-[13px] w-[13px]" />
          </span>
        ) : null}
        <p className="text-sm font-semibold text-neutral-600">{section.label}</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-neutral-100">
        <div className="flex items-center text-xs text-neutral-400 h-9 border-b border-neutral-100 bg-neutral-50">
          <p className="w-10 text-center">{t("rank")}</p>
          <div className="flex-1 px-3">{t("titleCol")}</div>
          <p className="w-12 text-center">{t("change")}</p>
        </div>
        {section.items.length === 0 ? (
          <div className="flex h-16 items-center justify-center text-sm text-neutral-400">
            {section.error ?? t("notCharted")}
          </div>
        ) : (
          section.items.map((entry) => (
            <ChartRow key={`${entry.rank}-${entry.title}`} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}

export function ChartsFullPanel({ data }: { data: FullChartsData }) {
  const [activeKey, setActiveKey] = useState(data.providers[0]?.key ?? "");
  const activeProvider = data.providers.find((p) => p.key === activeKey);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {data.providers.map((p) => {
          const isActive = p.key === activeKey;
          const color = PROVIDER_COLORS[p.key] ?? "#111827";
          const serviceId = resolveMusicServiceIdFromLabel(p.label);

          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setActiveKey(p.key)}
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
                  <MusicServiceIcon service={serviceId} label={p.label} size={16} className="h-4 w-4" />
                </span>
              ) : null}
              <span className="leading-none">{p.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {!activeProvider ? null : activeProvider.sections.map((section) => (
          <SectionBlock key={section.label} section={section} providerKey={activeProvider.key} providerLabel={activeProvider.label} />
        ))}
      </div>
    </div>
  );
}
