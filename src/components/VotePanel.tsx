"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type VoteItem = {
  category: string;
  organizer: string;
  name: string;
  votePage: string;
  deadline: string;
  link: string;
  candidate: string;
  rank?: string;
  percent?: string;
  isActive: boolean;
};

// CSV 카테고리 값(한국어)은 내부 필터에 그대로 사용
const TAB_KEYS = ["전체", "시상식", "음악방송", "기타"] as const;
type Tab = (typeof TAB_KEYS)[number];

const ICON_EXTENSIONS = ["png", "webp", "jpg", "jpeg"];

function VotePageIcon({ votePage }: { votePage: string }) {
  const [extIndex, setExtIndex] = useState(0);

  if (!votePage || extIndex >= ICON_EXTENSIONS.length) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-neutral-100 text-[10px] font-bold text-neutral-400">
        {votePage ? votePage.slice(0, 1) : "?"}
      </span>
    );
  }

  const src = `/images/vote/투표/${votePage}.${ICON_EXTENSIONS[extIndex]}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={votePage}
      className="h-5 w-5 rounded-md object-contain"
      onError={() => setExtIndex((prev) => prev + 1)}
    />
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("vote");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        isActive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-neutral-100 text-neutral-400"
      )}
    >
      {isActive ? t("active") : t("ended")}
    </span>
  );
}

function VoteCard({ item }: { item: VoteItem }) {
  const t = useTranslations("vote");
  const deadlineLabel = item.deadline ? item.deadline.replace(/-/g, ".") : "";
  const hasRank = item.rank && item.rank !== "";
  const rankLabel = hasRank
    ? item.percent
      ? t("rankLabelWithPercent", { rank: item.rank, percent: item.percent })
      : t("rankLabel", { rank: item.rank })
    : null;

  return (
    <div className="flex flex-col rounded-2xl border border-foreground/10 bg-white p-3.5 shadow-sm">
      {/* Row 1: 카테고리 + 상태 */}
      <div className="flex items-center gap-1">
        {item.category && (
          <span className="rounded-full bg-foreground/8 px-1.5 py-0.5 text-[10px] text-foreground/60">
            {item.category}
          </span>
        )}
        <StatusBadge isActive={item.isActive} />
      </div>

      {/* Row 2: 투표주최 */}
      <p className="mt-1 text-xs font-semibold leading-tight text-foreground/70">{item.organizer || ""}</p>

      {/* Row 3: 아이콘 + 투표페이지 */}
      <div className="mt-1.5 flex items-center gap-1.5">
        <VotePageIcon votePage={item.votePage} />
        <span className="text-xs text-neutral-500">{item.votePage || "-"}</span>
      </div>

      {/* Row 4: 투표이름 + 후보 */}
      <p className="mt-1 text-sm font-bold leading-snug">{item.name}</p>
      {item.candidate && (
        <span className="mt-1 self-start rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
          {item.candidate}
        </span>
      )}

      {/* Row 5: 마감날짜 + 순위 */}
      {deadlineLabel && (
        <p className="mt-1.5 text-[11px] text-neutral-400">~{deadlineLabel} (KST)</p>
      )}
      {rankLabel && (
        <p className="mt-0.5 text-[11px] font-medium text-neutral-500">{rankLabel}</p>
      )}

      {/* Row 6: 투표 바로가기 버튼 */}
      {item.link ? (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition",
            item.isActive
              ? "bg-yellow-300 text-yellow-900 hover:bg-yellow-400"
              : "pointer-events-none bg-neutral-100 text-neutral-400"
          )}
        >
          {t("goVote")}
          {item.isActive && (
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </a>
      ) : null}
    </div>
  );
}

export function VotePanel({ items, guideHref }: { items: VoteItem[]; guideHref?: string }) {
  const t = useTranslations("vote");
  const [activeTab, setActiveTab] = useState<Tab>("전체");

  const TAB_LABELS: Record<Tab, string> = {
    "전체": t("tab.all"),
    "시상식": t("tab.award"),
    "음악방송": t("tab.music"),
    "기타": t("tab.other"),
  };

  const filtered = useMemo(() => {
    if (activeTab === "전체") return items;
    return items.filter((item) => item.category === activeTab);
  }, [items, activeTab]);

  const active = filtered.filter((i) => i.isActive);
  const ended = filtered.filter((i) => !i.isActive);

  return (
    <div>
      <div className="flex items-center">
        <div className="relative inline-flex items-center">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as Tab)}
            className="appearance-none rounded-full border border-foreground/15 bg-white py-2 pl-4 pr-8 text-sm font-medium text-foreground/80 shadow-sm outline-none"
          >
            {TAB_KEYS.map((tab) => (
              <option key={tab} value={tab}>{TAB_LABELS[tab]}</option>
            ))}
          </select>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-foreground/40" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {guideHref && (
          <Link
            href={guideHref}
            className="ml-auto shrink-0 inline-flex items-center gap-1 rounded-full border border-foreground/15 bg-white px-4 py-2 text-sm font-medium text-foreground/70 shadow-sm transition hover:bg-foreground/5"
          >
            {t("guide")}
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}
      </div>

      <div className="mt-5">
        {active.length === 0 && ended.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-2xl border border-foreground/10 bg-white text-sm text-neutral-400">
            {t("noVotes")}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {active.map((item, i) => (
                <VoteCard key={i} item={item} />
              ))}
            </div>
            {ended.length > 0 && active.length > 0 && (
              <p className="pt-4 pb-2 text-xs font-semibold text-neutral-400">{t("endedSection")}</p>
            )}
            {ended.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {ended.map((item, i) => (
                  <VoteCard key={`ended-${i}`} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
