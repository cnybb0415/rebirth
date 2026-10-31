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

// 홈 원클릭 스트리밍 — 서비스마다 아치형 카드
// - 이 기기에서 열리는 링크가 1개면 카드 전체가 재생 버튼
// - 멜론·바이브처럼 나뉜 경우 카드 아래 1·2·3·4 버튼
// - 이 기기에서 못 여는 서비스는 흐리게 + "휴대폰에서 재생"
// 링크는 src/config/site.ts 의 oneClickStreamingLinks 그대로

type Part = { key: string; short: string; label: string; href: string };
type Group = { key: string; service: string; name: string; parts: Part[] };

const SERVICE_NAME: Record<string, string> = {
  melon: "Melon",
  genie: "Genie",
  bugs: "Bugs",
  flo: "FLO",
  vibe: "VIBE",
  youtube: "YouTube",
};

// 아치 배경 (서비스 색을 옅게)
const TINT: Record<string, string> = {
  melon: "#cfe3c4",
  "melon-wave": "#e3e8bf",
  genie: "#c9dbef",
  bugs: "#f3cfc0",
  flo: "#d3d1f2",
  vibe: "#e2cdef",
  youtube: "#f1c9c3",
};

function groupLinks(links: ReadonlyArray<OneClickStreamingLink>, platform: Platform): Group[] {
  const map = new Map<string, Group>();
  for (const link of links) {
    const isWave = link.label.includes("뮤직웨이브");
    const key = isWave ? `${link.id}-wave` : link.id;
    const name = isWave ? "Musicwave" : SERVICE_NAME[link.id] ?? link.label;
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

  return (
    <section aria-labelledby="home-streaming-title" className={HOME_CARD}>
      <SectionHead
        id="home-streaming-title"
        no="01"
        label={t("actionStreaming")}
        title="One-click"
        em="stream"
        right={
          platform ? (
            <span className="rounded-full bg-[#221e1a] px-3 py-1.5 text-[11px] font-semibold text-[#faf6ef]">
              {platform === "ios" ? "iPhone" : platform === "android" ? "Android" : "PC"}
            </span>
          ) : null
        }
      />

      <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
        {groups.map((g, i) => {
          const available = platform !== null && g.parts.length > 0;
          const single = available && g.parts.length === 1;
          const no = String(i + 1).padStart(2, "0");

          const arch = (
            <span
              className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-t-[999px] rounded-b-[18px] transition duration-300 group-hover:brightness-[1.03]"
              style={{ background: TINT[g.key] ?? "#e8e0d2" }}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(34,30,26,0.12)] transition duration-300 group-hover:-translate-y-1">
                <MusicServiceIcon service={g.service as never} label={g.name} size={30} className="h-[30px] w-[30px]" />
              </span>
              {single ? (
                <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#221e1a] text-[#faf6ef]">
                  <PlayIcon />
                </span>
              ) : null}
            </span>
          );

          const caption = (
            <span className="mt-2.5 flex items-baseline gap-2">
              <span className="text-[10px] font-semibold tabular-nums text-[#6e655b]">{no}</span>
              <span className="font-display text-[26px] leading-none text-[#221e1a]">{g.name}</span>
            </span>
          );

          return (
            <li key={g.key} className={available ? undefined : "opacity-45"}>
              {single ? (
                <button
                  type="button"
                  onClick={() => openHref(g.parts[0].href)}
                  aria-label={`${g.parts[0].label} 재생`}
                  className="group block w-full text-left"
                >
                  {arch}
                  {caption}
                </button>
              ) : (
                <div className="group">
                  {arch}
                  {caption}
                  {available ? (
                    <div className="mt-2 flex gap-1.5">
                      {g.parts.map((p) => (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => openHref(p.href)}
                          aria-label={`${p.label} 재생`}
                          className="h-10 min-w-0 flex-1 rounded-full border border-[#221e1a]/15 text-[13px] font-bold tabular-nums text-[#221e1a] transition hover:bg-[#221e1a] hover:text-[#faf6ef] active:scale-95"
                        >
                          {p.short}
                        </button>
                      ))}
                    </div>
                  ) : platform !== null ? (
                    <p className="mt-1 text-[11px] text-[#6e655b]">{t("streamingPhoneOnly")}</p>
                  ) : null}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 4.5v15l12.5-7.5z" />
    </svg>
  );
}
