"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { MusicServiceIcon } from "@/components/MusicServiceIcon";
import { HOME_CARD, SectionHead } from "@/components/home/SectionHead";
import {
  detectPlatform,
  openHref,
  pickHref,
  type OneClickStreamingLink,
  type Platform,
} from "@/components/OneClickStreamingGrid";

// 홈 원클릭 스트리밍 — 서비스별 타일
// - 이 기기에서 열리는 링크가 1개면 카드 전체가 재생 버튼
// - 멜론·바이브처럼 나뉜 경우 카드 아래 1·2·3·4 버튼
// - 이 기기에서 못 여는 서비스는 숨기고 안내 한 줄
// 링크는 src/config/site.ts 의 oneClickStreamingLinks 그대로

type Part = { key: string; short: string; label: string; href: string };
type Group = { key: string; service: string; name: string; parts: Part[] };

const SERVICE_NAME: Record<string, string> = {
  melon: "멜론",
  genie: "지니",
  bugs: "벅스",
  flo: "플로",
  vibe: "바이브",
  youtube: "유튜브",
};

function groupLinks(links: ReadonlyArray<OneClickStreamingLink>, platform: Platform): Group[] {
  const map = new Map<string, Group>();
  for (const link of links) {
    const isWave = link.label.includes("뮤직웨이브");
    const key = isWave ? `${link.id}-wave` : link.id;
    const name = isWave ? "뮤직웨이브" : SERVICE_NAME[link.id] ?? link.label;
    if (!map.has(key)) map.set(key, { key, service: link.id, name, parts: [] });
    const href = pickHref(link, platform);
    if (!href) continue;
    const num = link.label.match(/(\d+)\s*$/)?.[1];
    map.get(key)!.parts.push({ key: link.label, short: num ?? link.label, label: link.label, href });
  }
  return [...map.values()];
}

export function HomeStreamingCard({ links }: { links: ReadonlyArray<OneClickStreamingLink> }) {
  const t = useTranslations("home");
  const [platform, setPlatform] = React.useState<Platform | null>(null);

  React.useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const groups = groupLinks(links, platform ?? "other");
  // 이 기기에서 열리는 서비스만 보여줌 (나머지는 안내 한 줄)
  const visible = platform === null ? [] : groups.filter((g) => g.parts.length > 0);
  const hidden = groups.length - visible.length;

  return (
    <section aria-labelledby="home-streaming-title" className={HOME_CARD}>
      <SectionHead
        id="home-streaming-title"
        label={t("actionStreaming")}
        right={
          platform ? (
            <span className="rounded-full bg-[#f4f4f5] px-2.5 py-1 text-[11px] font-medium text-[#71717a]">
              {platform === "ios" ? "iPhone" : platform === "android" ? "Android" : "PC"}
            </span>
          ) : null
        }
      />

      <ul className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-3">
        {visible.map((g) => {
          const single = g.parts.length === 1;
          const icon = (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f4f5]">
              <MusicServiceIcon service={g.service as never} label={g.name} size={20} className="h-5 w-5" />
            </span>
          );
          return (
            <li key={g.key} className={single ? undefined : "col-span-2 lg:col-span-1"}>
              {single ? (
                <button
                  type="button"
                  onClick={() => openHref(g.parts[0].href)}
                  aria-label={`${g.parts[0].label} 재생`}
                  className="flex h-14 w-full items-center gap-3 rounded-xl border border-[#e4e4e7] px-3 text-left transition hover:bg-[#fafafa] active:scale-[0.99]"
                >
                  {icon}
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#18181b]">{g.name}</span>
                  <PlayIcon />
                </button>
              ) : (
                <div className="flex h-14 w-full items-center gap-3 rounded-xl border border-[#e4e4e7] px-3">
                  {icon}
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#18181b]">{g.name}</span>
                  <span className="flex gap-1">
                    {g.parts.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => openHref(p.href)}
                        aria-label={`${p.label} 재생`}
                        className="h-9 w-9 rounded-lg bg-[#f4f4f5] text-[13px] font-bold tabular-nums text-[#18181b] transition hover:bg-[#18181b] hover:text-white"
                      >
                        {p.short}
                      </button>
                    ))}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {platform !== null && hidden > 0 ? (
        <p className="mt-3 text-xs text-[#71717a]">{t("streamingPhoneHint")}</p>
      ) : null}
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#a1a1aa" aria-hidden className="shrink-0">
      <path d="M7 4.5v15l12.5-7.5z" />
    </svg>
  );
}
