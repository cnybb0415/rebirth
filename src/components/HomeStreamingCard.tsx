"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { MusicServiceIcon } from "@/components/MusicServiceIcon";
import {
  detectPlatform,
  openHref,
  pickHref,
  type OneClickStreamingLink,
  type Platform,
} from "@/components/OneClickStreamingGrid";

// 홈 원클릭 스트리밍 카드
// - 서비스별 타일. 이 기기에서 열리는 링크가 1개면 타일을 누르면 바로 재생
// - 멜론·바이브처럼 여러 개로 나뉜 경우 타일 아래 번호 버튼(1·2·3·4)으로 나눠 누름
// - 링크는 src/config/site.ts 의 oneClickStreamingLinks 그대로 사용

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
    if (!href) continue; // 이 기기에서 안 열리는 링크(iOS 전용 등)는 숨김
    const num = link.label.match(/(\d+)\s*$/)?.[1];
    map.get(key)!.parts.push({ key: link.label, short: num ?? link.label, label: link.label, href });
  }
  // 번호 버튼이 있는 서비스(한 줄 전체)는 앞뒤로, 버튼 하나짜리는 가운데 두 칸씩 모아 빈칸이 덜 생기게
  const groups = [...map.values()].filter((g) => g.parts.length > 0);
  const wide = groups.filter((g) => g.parts.length > 2);
  const narrow = groups.filter((g) => g.parts.length <= 2);
  return [...wide.slice(0, 1), ...narrow, ...wide.slice(1)];
}

export function HomeStreamingCard({ links }: { links: ReadonlyArray<OneClickStreamingLink> }) {
  const t = useTranslations("home");
  const [platform, setPlatform] = React.useState<Platform | null>(null);

  React.useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const groups = platform ? groupLinks(links, platform) : [];

  return (
    <section
      aria-labelledby="home-streaming-title"
      className="overflow-hidden rounded-3xl bg-[#111114] p-5 text-white shadow-sm sm:p-6"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-white/55">ONE-CLICK STREAMING</p>
          <h2 id="home-streaming-title" className="mt-1 text-lg font-bold sm:text-xl">
            {t("actionStreaming")}
          </h2>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70">
          {platform === "ios" ? "iPhone" : platform === "android" ? "Android" : "PC"}
        </span>
      </div>

      {platform === null ? (
        <div className="mt-4 grid grid-cols-2 gap-2" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/[0.07]" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white/[0.07] px-4 py-5 text-center text-sm text-white/70">
          {t("streamingMobileOnly")}
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-2">
          {groups.map((g) => {
            const single = g.parts.length === 1;
            return (
              <li key={g.key} className={g.parts.length > 2 ? "col-span-2" : undefined}>
                {single ? (
                  <button
                    type="button"
                    onClick={() => openHref(g.parts[0].href)}
                    className="flex h-14 w-full items-center gap-3 rounded-2xl bg-white/[0.08] px-3.5 text-left transition hover:bg-white/[0.14] active:scale-[0.98]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white">
                      <MusicServiceIcon service={g.service as never} label={g.name} size={20} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{g.name}</span>
                    <PlayIcon />
                  </button>
                ) : (
                  <div className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-white/[0.08] px-3.5 py-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white">
                      <MusicServiceIcon service={g.service as never} label={g.name} size={20} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 shrink-0 text-sm font-semibold">{g.name}</span>
                    <span className="ml-auto flex flex-wrap justify-end gap-1.5">
                      {g.parts.map((p) => (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => openHref(p.href)}
                          aria-label={p.label}
                          className="h-9 min-w-9 rounded-xl bg-white/[0.12] px-2.5 text-sm font-bold tabular-nums transition hover:bg-[#ffd84a] hover:text-[#111114] active:scale-95"
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
      )}
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffd84a" aria-hidden className="shrink-0">
      <path d="M7 4.5v15l12.5-7.5z" />
    </svg>
  );
}
