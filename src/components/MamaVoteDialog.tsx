"use client";

import { useRef, useState, type ReactNode } from "react";
import type { LabLang } from "@/data/lab";
import { MAMA_VOTE, xComposeUrl, xSearchUrl } from "@/data/homeVotePopup";
import { PROMO_LINK } from "@/data/labPromos";

// MAMA 투표 광고 창 (메인 입장 팝업 · EXO.zip 다운로드 전 광고가 같이 씀)
// - 링크·문구·기간은 src/data/homeVotePopup.ts 에서 관리
// - footer 자리에 각자 하단 내용(오늘 하루 보지 않기 / 다운로드 카운트다운)을 넣음

const KST_DATE = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }); // YYYY-MM-DD
export const todayKst = () => KST_DATE.format(new Date());
export const GOLD = "#ffd84a";

const COPY: Record<LabLang, {
  title: string; dday: (n: number) => string;
  vote: string; votePct: string; post: string; postPct: string;
  repost: string; howTo: string; details: string; back: string; close: string;
}> = {
  ko: {
    title: "EXO 에게 투표해 주세요",
    dday: (n) => (n === 0 ? "오늘 마감" : `마감 D-${n}`),
    vote: "Mnet Plus 투표",
    votePct: "90%",
    post: "해시태그 투표",
    postPct: "10%",
    repost: "해시태그 글 재게시",
    details: "EXO 음원총공팀",
    howTo: "투표 방법",
    back: "돌아가기",
    close: "닫기",
  },
  en: {
    title: "Vote for EXO",
    dday: (n) => (n === 0 ? "Ends today" : `D-${n}`),
    vote: "Mnet Plus vote",
    votePct: "90%",
    post: "Hashtag vote",
    postPct: "10%",
    repost: "Repost tagged posts",
    details: "EXO Streaming Team",
    howTo: "How to vote",
    back: "Back",
    close: "Close",
  },
};

// 마감일까지 남은 날 (한국 날짜 기준)
const daysLeft = () =>
  Math.max(0, Math.round((Date.parse(MAMA_VOTE.endsAt.slice(0, 10)) - Date.parse(todayKst())) / 86_400_000));

export const isMamaVoteOver = () => Date.now() > Date.parse(MAMA_VOTE.endsAt);

function XLogo({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function HowTo({ images, maxH }: { images: string[]; maxH: string }) {
  const [idx, setIdx] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const go = (i: number) => track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: "smooth" });

  const arrow =
    "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-xl text-white backdrop-blur transition hover:bg-black/80 disabled:pointer-events-none disabled:opacity-0 [@media(hover:hover)]:flex";

  return (
    <div>
      {/* 모바일: 손가락으로 밀어서 넘김 / PC(마우스): 양옆 화살표·키보드 ←→ */}
      <div
        className="relative"
        tabIndex={0}
        aria-roledescription="carousel"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(Math.min(images.length - 1, idx + 1));
          if (e.key === "ArrowLeft") go(Math.max(0, idx - 1));
        }}
      >
        <div
          ref={track}
          onScroll={(e) => setIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`HOW TO VOTE ${i + 2}`}
              draggable={false}
              className={`aspect-[3/4] w-full shrink-0 snap-center snap-always object-contain ${maxH}`}
            />
          ))}
        </div>
        <button type="button" aria-label="이전" onClick={() => go(idx - 1)} disabled={idx === 0} className={`${arrow} left-2`}>
          ‹
        </button>
        <button
          type="button"
          aria-label="다음"
          onClick={() => go(idx + 1)}
          disabled={idx === images.length - 1}
          className={`${arrow} right-2`}
        >
          ›
        </button>
      </div>
      <div className="flex items-center justify-center gap-1.5 py-3">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => go(i)}
            aria-label={`${i + 1} / ${images.length}`}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5" : "w-1.5 bg-white/25"}`}
            style={i === idx ? { background: GOLD } : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export function MamaVoteDialog({
  lang,
  titleId,
  onClose,
  footer,
  imageMaxH,
  howToMaxH,
  zIndex = 60,
}: {
  lang: LabLang;
  titleId: string;
  onClose: () => void;
  footer: ReactNode;
  // 화면이 낮을 때 사진 높이 한도 (아래 내용 높이만큼 뺀 값). Tailwind가 찾을 수 있게 클래스 문자열 그대로 넘김
  imageMaxH: string;
  howToMaxH: string;
  zIndex?: number;
}) {
  const c = COPY[lang];
  const [view, setView] = useState<"main" | "howto">("main");

  return (
    <div
      className="fixed inset-0 flex items-end justify-center bg-black/65 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:p-4"
      style={{ zIndex }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        lang={lang}
        // 폭은 고정. 화면이 낮으면 사진 위아래 빈 우주 배경만 살짝 잘라서 한 화면에 다 들어가게 함
        style={{ width: "min(100%, 360px)" }}
        className="relative flex max-h-[calc(100svh-1.5rem)] flex-col overflow-hidden rounded-[28px] bg-[#0a0c18] text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={c.close}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-lg text-white/90 backdrop-blur hover:bg-black/70"
        >
          ✕
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {view === "main" ? (
            <>
              {/* 투표 메인 이미지(1:1). 사진은 항상 폭에 꽉 차고, 화면이 낮으면 위아래만 살짝 잘림 */}
              <div className="relative bg-[#05060f]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={MAMA_VOTE.mainImage}
                  alt="2026 MAMA HOW TO VOTE: 팬스 초이스 남자, 올해의 팬스 초이스 with VISA 모두 EXO 선택"
                  className={`block aspect-square w-full object-cover ${imageMaxH}`}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0a0c18] to-transparent" />
              </div>

              <div className="space-y-3 px-5 pb-3.5 pt-2.5 [@media(max-height:700px)]:space-y-2.5 [@media(max-height:700px)]:px-4 [@media(max-height:700px)]:pb-3">
                {/* 제목 + 마감 */}
                <div className="flex items-center justify-between gap-3">
                  <h2 id={titleId} className="min-w-0 whitespace-nowrap text-xl font-extrabold leading-tight tracking-tight [@media(max-height:600px)]:text-lg">
                    {c.title}
                  </h2>
                  <span className="shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold tabular-nums text-black" style={{ background: GOLD }}>
                    {c.dday(daysLeft())}
                  </span>
                </div>

                {/* 투표 버튼 */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={MAMA_VOTE.voteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-center text-black transition active:scale-[0.97]"
                    style={{ background: GOLD, boxShadow: `0 6px 20px ${GOLD}33` }}
                  >
                    <span className="whitespace-nowrap text-sm font-extrabold leading-tight">{c.vote}</span>
                    <span className="rounded-md bg-black/10 px-1 py-0.5 text-[10px] font-bold max-[350px]:hidden">{c.votePct}</span>
                  </a>
                  <a
                    href={xComposeUrl(lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-2 text-center transition hover:bg-white/[0.09] active:scale-[0.97]"
                  >
                    <span className="flex items-center gap-1.5 whitespace-nowrap text-sm font-bold leading-tight">
                      <XLogo /> {c.post}
                    </span>
                    <span className="rounded-md bg-white/10 px-1 py-0.5 text-[10px] font-bold text-white/75 max-[350px]:hidden">{c.postPct}</span>
                  </a>
                </div>

                {/* 보조 링크 (한 줄) */}
                <div className="flex items-center justify-center gap-2 whitespace-nowrap text-[11px] font-semibold text-white/55 max-[340px]:text-[10px]">
                  <a href={xSearchUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {c.repost}<span className="max-[380px]:hidden"> ↗</span>
                  </a>
                  <span className="h-2.5 w-px bg-white/20" aria-hidden />
                  <button type="button" onClick={() => setView("howto")} className="hover:text-white">
                    {c.howTo}<span className="max-[380px]:hidden"> ›</span>
                  </button>
                  <span className="h-2.5 w-px bg-white/20" aria-hidden />
                  <a
                    href={PROMO_LINK.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={PROMO_LINK.label[lang]}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <XLogo size={10} /> {c.details}<span className="max-[380px]:hidden"> ↗</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-14 items-center px-4 pr-14">
                <button
                  type="button"
                  onClick={() => setView("main")}
                  className="rounded-full px-2 py-1 text-sm font-semibold text-white/70 hover:text-white"
                >
                  ‹ {c.back}
                </button>
              </div>
              <HowTo images={MAMA_VOTE.howToImages} maxH={howToMaxH} />
            </>
          )}
        </div>

        <div className="shrink-0 border-t border-white/10">{footer}</div>
      </div>
    </div>
  );
}
