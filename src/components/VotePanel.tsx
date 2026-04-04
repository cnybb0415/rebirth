"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export type VoteItem = {
  category: string;
  organizer: string;   // 투표주최
  name: string;        // 투표이름
  votePage: string;    // 투표페이지
  deadline: string;    // YYYY-MM-DD
  link: string;
  candidate: string;   // 후보
  rank?: string;       // 순위
  percent?: string;    // 퍼센트
  isActive: boolean;
};

const TABS = ["전체", "시상식", "음악방송", "기타"] as const;
type Tab = (typeof TABS)[number];

const ICON_EXTENSIONS = ["png", "webp", "jpg", "jpeg"];

function VotePageIcon({ votePage }: { votePage: string }) {
  const [extIndex, setExtIndex] = useState(0);

  if (!votePage || extIndex >= ICON_EXTENSIONS.length) {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-100 text-[10px] font-bold text-neutral-400">
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
      className="h-6 w-6 rounded-md object-contain"
      onError={() => setExtIndex((prev) => prev + 1)}
    />
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        isActive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-neutral-100 text-neutral-400"
      )}
    >
      {isActive ? "진행중" : "종료"}
    </span>
  );
}

function VoteCard({ item }: { item: VoteItem }) {
  const deadlineLabel = item.deadline ? item.deadline.replace(/-/g, ".") : "";
  const hasRank = item.rank && item.rank !== "";
  const rankLabel = hasRank
    ? `현재순위: ${item.rank}위${item.percent ? ` (${item.percent}%)` : ""}`
    : null;

  return (
    <div className="flex flex-col rounded-2xl border border-foreground/10 bg-white p-3.5 shadow-sm">
      {/* Row 1: 투표주최 / 카테고리 + 상태 */}
      <div className="flex items-start justify-between gap-1.5">
        <span className="text-xs font-semibold text-foreground/70 leading-tight">{item.organizer || "-"}</span>
        <div className="flex shrink-0 items-center gap-1">
          {item.category && (
            <span className="rounded-full bg-foreground/8 px-1.5 py-0.5 text-[10px] text-foreground/60">
              {item.category}
            </span>
          )}
          <StatusBadge isActive={item.isActive} />
        </div>
      </div>

      {/* Row 2: 투표페이지 아이콘 + 이름 · 투표이름 [후보] */}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <VotePageIcon votePage={item.votePage} />
        <span className="text-xs text-neutral-500">{item.votePage || "-"}</span>
        {item.name && <span className="text-xs text-neutral-300">·</span>}
        <span className="text-sm font-bold leading-tight">{item.name}</span>
        {item.candidate && (
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
            {item.candidate}
          </span>
        )}
      </div>

      {/* Row 3: 마감날짜 + 순위 */}
      {deadlineLabel && (
        <p className="mt-1.5 text-[11px] text-neutral-400">~{deadlineLabel} (KST)</p>
      )}
      {rankLabel && (
        <p className="mt-0.5 text-[11px] font-medium text-neutral-500">{rankLabel}</p>
      )}

      {/* Row 4: 투표 바로가기 버튼 */}
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
          투표 바로가기
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
  const [activeTab, setActiveTab] = useState<Tab>("전체");

  const filtered = useMemo(() => {
    if (activeTab === "전체") return items;
    return items.filter((item) => item.category === activeTab);
  }, [items, activeTab]);

  const active = filtered.filter((i) => i.isActive);
  const ended = filtered.filter((i) => !i.isActive);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                activeTab === tab
                  ? "border-transparent bg-yellow-300 text-yellow-900"
                  : "border-foreground/15 bg-white text-foreground/70 hover:bg-foreground/5"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        {guideHref && (
          <a
            href={guideHref}
            className="shrink-0 inline-flex items-center gap-1 rounded-full border border-foreground/15 bg-white px-3 py-1.5 text-sm font-medium text-foreground/70 transition hover:bg-foreground/5"
          >
            투표 가이드
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>

      <div className="mt-5">
        {active.length === 0 && ended.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-2xl border border-foreground/10 bg-white text-sm text-neutral-400">
            등록된 투표가 없습니다
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {active.map((item, i) => (
                <VoteCard key={i} item={item} />
              ))}
            </div>
            {ended.length > 0 && active.length > 0 && (
              <p className="pt-4 pb-2 text-xs font-semibold text-neutral-400">종료된 투표</p>
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
