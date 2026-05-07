"use client";

import * as React from "react";
import { openSms } from "@/lib/sms";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight, BookOpen, AlignJustify } from "lucide-react";

const SMS_BODY = "EXO Crown 신청합니다!";

// ── 타입 (서버 컴포넌트와 공유) ───────────────────────
export type RadioProgram = {
  name: string;
  start: number; // KST 자정 기준 분
  end: number;
  selectable: boolean;
};

export type RadioStation = {
  id: string;
  broadcaster: string;
  name: string;
  frequency: string;
  smsTo: string;
  programs: RadioProgram[];
};

// ── 헬퍼 ──────────────────────────────────────────────
function getKSTMinutes(): number {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const kst = new Date(utcMs + 9 * 3600 * 1000);
  return kst.getHours() * 60 + kst.getMinutes();
}

function isAiring(p: RadioProgram, mins: number): boolean {
  if (p.start < p.end) return mins >= p.start && mins < p.end;
  if (p.end === 0) return mins >= p.start;
  return mins >= p.start || mins < p.end;
}

function getCurrentProgram(station: RadioStation, mins: number): RadioProgram | null {
  return station.programs.find((p) => isAiring(p, mins)) ?? null;
}

function getNextSelectable(station: RadioStation, mins: number): string | null {
  const future = station.programs
    .filter((p) => p.selectable && !isAiring(p, mins))
    .map((p) => {
      const diff = p.start > mins ? p.start - mins : p.start + 1440 - mins;
      return { p, diff };
    })
    .sort((a, b) => a.diff - b.diff)[0];
  if (!future) return null;
  return `${Math.floor(future.p.start / 60).toString().padStart(2, "0")}:${(future.p.start % 60).toString().padStart(2, "0")}`;
}

function formatTime(mins: number): string {
  return `${Math.floor(mins / 60).toString().padStart(2, "0")}:${(mins % 60).toString().padStart(2, "0")}`;
}

// ── 상수 ──────────────────────────────────────────────
const BROADCASTERS = ["SBS", "KBS", "MBC"] as const;

const BROADCASTER_COLOR: Record<string, string> = {
  SBS: "bg-rose-400",
  KBS: "bg-violet-400",
  MBC: "bg-sky-400",
};

const GUIDE_IMAGES = [
  "01.라디오 신청 가이드.png",
  "02.KBS.png",
  "03.MBC.png",
  "04.SBS.png",
].map((name) => ({
  src: `/images/radio/schedule/${encodeURIComponent(name)}`,
  alt: name.replace(/^\d+\./, "").replace(".png", ""),
}));

// ── 바디 스크롤 잠금 ──────────────────────────────────
function useBodyScrollLock() {
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
}

// ── 가이드 모달 ────────────────────────────────────────
function GuideModal({ onClose }: { onClose: () => void }) {
  const [idx, setIdx] = React.useState(0);
  const total = GUIDE_IMAGES.length;
  const scrollRef = React.useRef<HTMLDivElement>(null);
  useBodyScrollLock();

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [idx]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + total) % total);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % total);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, total]);

  const img = GUIDE_IMAGES[idx];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative flex w-full flex-col sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-xl overflow-hidden"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">라디오 신청 가이드</span>
            <span className="text-xs text-foreground/40">{idx + 1} / {total}</span>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-foreground/5">
            <X size={16} />
          </button>
        </div>

        {/* 이미지 스크롤 영역: overflow-y-auto를 flex-1에 직접 적용 */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-gray-50"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} alt={img.alt} className="w-full h-auto block" />
        </div>

        {/* 화살표: 모달 컨테이너(relative) 기준으로 absolute 배치 */}
        <button
          type="button"
          onClick={() => setIdx((i) => (i - 1 + total) % total)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 border border-white/20 p-2 text-white"
          aria-label="이전"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => setIdx((i) => (i + 1) % total)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 border border-white/20 p-2 text-white"
          aria-label="다음"
        >
          <ChevronRight size={16} />
        </button>

        <div className="flex shrink-0 justify-center gap-2 py-3">
          {GUIDE_IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`${i + 1}번 이미지`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === idx ? "w-5 bg-foreground" : "w-1.5 bg-foreground/20"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 전체 편성표 모달 ───────────────────────────────────
function FullScheduleModal({
  onClose,
  mins,
  stations,
}: {
  onClose: () => void;
  mins: number;
  stations: RadioStation[];
}) {
  const stationsWithSchedule = stations.filter((s) => s.programs.length > 0);
  const [activeId, setActiveId] = React.useState(stationsWithSchedule[0]?.id ?? "");
  useBodyScrollLock();

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const activeStation = stationsWithSchedule.find((s) => s.id === activeId);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative flex w-full flex-col sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white overflow-hidden shadow-xl"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">전체 편성표</span>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-foreground/5">
            <X size={16} />
          </button>
        </div>

        <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b px-3 py-2.5 [scrollbar-width:none]">
          {stationsWithSchedule.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition",
                activeId === s.id
                  ? "bg-foreground text-background"
                  : "border border-foreground/15 text-foreground/60 hover:bg-foreground/5"
              )}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {activeStation?.programs.map((p) => {
            const airing = isAiring(p, mins);
            return (
              <div
                key={p.name + p.start}
                className={cn(
                  "flex items-center gap-3 border-b border-foreground/5 px-4 py-3 last:border-0",
                  airing && "bg-foreground/[0.03]"
                )}
              >
                <span className="w-[4.5rem] shrink-0 tabular-nums text-xs text-foreground/45">
                  {formatTime(p.start)}~{p.end === 0 ? "00:00" : formatTime(p.end)}
                </span>
                <span className={cn("flex-1 text-sm", airing ? "font-semibold" : "text-foreground/80")}>
                  {p.name}
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  {airing && <span className="text-[10px] font-bold text-rose-500">NOW</span>}
                  {p.selectable && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-4 border-t bg-foreground/[0.02] px-4 py-2.5">
          <span className="flex items-center gap-1 text-[10px] text-foreground/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            선정 가능
          </span>
          <span className="flex items-center gap-1 text-[10px] text-foreground/40">
            <span className="text-[10px] font-bold text-rose-500">NOW</span>
            현재 방송중
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 스테이션 카드 ──────────────────────────────────────
function StationCard({ station, mins }: { station: RadioStation; mins: number }) {
  const current = getCurrentProgram(station, mins);
  const hasSchedule = station.programs.length > 0;
  const nextSelectableTime =
    hasSchedule && (!current || !current.selectable) ? getNextSelectable(station, mins) : null;

  return (
    <button
      type="button"
      onClick={() => openSms({ to: station.smsTo, body: SMS_BODY })}
      className="group flex w-full items-stretch overflow-hidden rounded-2xl border border-foreground/10 bg-white text-left shadow-sm transition hover:border-foreground/20 hover:shadow-md active:scale-[0.98]"
    >
      <div className={cn(
        "w-1 shrink-0 rounded-l-2xl",
        !hasSchedule || !current
          ? "bg-foreground/10"
          : current.selectable
          ? "bg-emerald-400"
          : "bg-foreground/10"
      )} />

      <div className="flex flex-1 flex-col justify-center gap-1 px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-sm font-bold">{station.name}</span>
            <span className="ml-2 text-xs text-foreground/40">{station.frequency}</span>
          </div>
          {hasSchedule && current && (
            <span className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              current.selectable ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"
            )}>
              {current.selectable ? "선정가능" : "선정불가"}
            </span>
          )}
        </div>

        {!hasSchedule ? (
          <p className="text-xs text-foreground/30">편성표 없음</p>
        ) : current ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] font-bold text-rose-500 leading-none">NOW</span>
            <span className="truncate text-sm font-medium">{current.name}</span>
            <span className="shrink-0 text-[10px] text-foreground/40 tabular-nums">
              {formatTime(current.start)}~{current.end === 0 ? "00:00" : formatTime(current.end)}
            </span>
          </div>
        ) : (
          <p className="text-xs text-foreground/30">현재 방송 없음</p>
        )}

        {nextSelectableTime && (
          <p className="text-[10px] text-amber-600">다음 신청 가능: {nextSelectableTime}</p>
        )}
      </div>

      <div className="flex flex-col items-center justify-center gap-1 border-l border-foreground/5 px-3.5">
        <span className="text-[10px] text-foreground/40">{station.smsTo}</span>
        <span className="rounded-xl bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background transition group-hover:bg-foreground/80">
          문자
        </span>
      </div>
    </button>
  );
}

// ── 메인 클라이언트 컴포넌트 ───────────────────────────
export function RadioPageClient({ stations }: { stations: RadioStation[] }) {
  const [mins, setMins] = React.useState<number | null>(null);
  const [showGuide, setShowGuide] = React.useState(false);
  const [showSchedule, setShowSchedule] = React.useState(false);

  React.useEffect(() => {
    setMins(getKSTMinutes());
    const id = setInterval(() => setMins(getKSTMinutes()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
      {showSchedule && mins !== null && (
        <FullScheduleModal
          onClose={() => setShowSchedule(false)}
          mins={mins}
          stations={stations}
        />
      )}

      <div className="min-h-screen bg-transparent text-foreground">
        <main className="mx-auto w-full max-w-2xl px-3 py-10 sm:px-6 sm:py-14">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">원클릭 라디오 문자 신청</h1>
              {mins !== null && (
                <p className="mt-0.5 text-xs text-foreground/40">
                  KST {formatTime(mins)} 기준 · 평일 편성 기준
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-1.5 rounded-full border border-foreground/15 bg-white px-3 py-1.5 text-xs font-medium text-foreground/70 shadow-sm hover:bg-foreground/5"
              >
                <BookOpen size={12} />
                가이드
              </button>
              <button
                type="button"
                onClick={() => setShowSchedule(true)}
                className="flex items-center gap-1.5 rounded-full border border-foreground/15 bg-white px-3 py-1.5 text-xs font-medium text-foreground/70 shadow-sm hover:bg-foreground/5"
              >
                <AlignJustify size={12} />
                편성표
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-7">
            {BROADCASTERS.map((bc) => {
              const bcStations = stations.filter((s) => s.broadcaster === bc);
              if (!bcStations.length) return null;
              return (
                <div key={bc}>
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className={cn("h-3.5 w-0.5 rounded-full", BROADCASTER_COLOR[bc])} />
                    <span className="text-sm font-bold">{bc}</span>
                  </div>
                  <div className="space-y-2">
                    {bcStations.map((station) => (
                      <StationCard key={station.id} station={station} mins={mins ?? 0} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
