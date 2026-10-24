"use client";

import { useEffect, useRef, useState } from "react";
import { labPromos, PROMO_LINK, PROMO_SECONDS } from "@/data/labPromos";
import type { LabLang } from "@/data/lab";

const BUTTON =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25";

const KST_DATE = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }); // YYYY-MM-DD
const DATE_OPTS = { month: "long", day: "numeric", weekday: "short", timeZone: "UTC" } as const;

const COPY = {
  ko: {
    eyebrow: "받기 전에 잠깐!",
    close: "닫기",
    title: "EXO에게 투표해 주세요! ♥️",
    lead: "투표가 오픈되면 잊지 말고 EXO에게 투표 해주세요!",
    live: "진행 중",
    opens: (date: string) => `${date} 오픈`,
    date: new Intl.DateTimeFormat("ko-KR", DATE_OPTS),
    security: (
      <>
        보안을 위해 펫 파일은 <b>꼭 이 페이지에서만</b> 받아주세요.
        다른 곳에서 받은 파일은 악성코드가 포함되어 있을 수 있습니다.
      </>
    ),
    wait: (s: number) => `${s}초 후 받을 수 있어요`,
    download: (name: string) => `${name} 받기`,
  },
  en: {
    eyebrow: "Wait, before you download!",
    close: "Close",
    title: "Vote for EXO! ♥️",
    lead: "When voting opens, don't forget to vote for EXO!",
    live: "LIVE",
    opens: (date: string) => `Opens ${date}`,
    date: new Intl.DateTimeFormat("en-US", DATE_OPTS),
    security: (
      <>
        For your safety, please download the pet file <b>only from this page</b>. Files from other sources may contain
        malware.
      </>
    ),
    wait: (s: number) => `Available in ${s}s`,
    download: (name: string) => `Download ${name}`,
  },
};

// 한국 시간 오늘 기준 디데이
function dDay(opensAt: string, liveLabel: string) {
  const diff = Math.round((Date.parse(opensAt) - Date.parse(KST_DATE.format(new Date()))) / 86_400_000);
  if (diff > 0) return { badge: `D-${diff}`, live: false };
  if (diff === 0) return { badge: "D-DAY", live: true };
  return { badge: liveLabel, live: true };
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M10 2.5a.75.75 0 0 1 .75.75v8.69l2.72-2.72a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 1 1 1.06-1.06l2.72 2.72V3.25A.75.75 0 0 1 10 2.5ZM3.75 15.5a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z" />
    </svg>
  );
}

export function DownloadWithPromo({
  href,
  fileName,
  label,
  lang,
}: {
  href: string;
  fileName: string;
  label: string;
  lang: LabLang;
}) {
  const c = COPY[lang];
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(PROMO_SECONDS);
  const dialogRef = useRef<HTMLDivElement>(null);
  const ready = left <= 0;

  // 1초씩 줄어드는 카운트다운
  useEffect(() => {
    if (!open || ready) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [open, ready, left]);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const start = () => {
    setLeft(PROMO_SECONDS);
    setOpen(true);
  };

  return (
    <>
      <button type="button" onClick={start} className={`${BUTTON} bg-foreground text-background hover:bg-foreground/90`}>
        <DownloadIcon />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lab-promo-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl outline-none"
          >
            <div className="flex items-center justify-between px-4 pt-3">
              <span className="text-xs font-semibold text-foreground/50">{c.eyebrow}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="-mr-1 flex h-8 w-8 items-center justify-center rounded-full text-foreground/50 hover:bg-foreground/5 hover:text-foreground"
                aria-label={c.close}
              >
                ✕
              </button>
            </div>

            <div className="px-4 pb-4 pt-1">
              <h2 id="lab-promo-title" className="text-lg font-bold">
                {c.title}
              </h2>
              <p className="mt-1 text-sm text-foreground/70">{c.lead}</p>
              <ul className="mt-3 space-y-2">
                {labPromos.map((p) => {
                  const d = dDay(p.opensAt, c.live);
                  return (
                    <li key={p.opensAt + p.title.en} className="flex items-center gap-3 rounded-xl border border-foreground/10 px-3 py-2.5">
                      <span
                        className={`flex h-10 min-w-[3.25rem] shrink-0 items-center justify-center rounded-lg px-2 text-sm font-extrabold tabular-nums ${
                          d.live ? "bg-red-600 text-white" : "bg-foreground text-background"
                        }`}
                      >
                        {d.badge}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-snug">{p.title[lang]}</p>
                        <p className="text-xs text-foreground/60">{c.opens(c.date.format(new Date(p.opensAt)))}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <a
                href={PROMO_LINK.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-foreground/15 bg-white text-sm font-semibold shadow-sm transition-colors hover:border-foreground/35"
              >
                {PROMO_LINK.label[lang]} <span aria-hidden>↗</span>
              </a>
            </div>

            <div className="border-t border-foreground/10 bg-foreground/[0.03] p-4">
              <p className="mb-3 flex gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
                <span aria-hidden>🔒</span>
                <span>{c.security}</span>
              </p>
              <div className="mb-3 h-1 overflow-hidden rounded-full bg-foreground/10" aria-hidden>
                <div
                  className="h-full rounded-full bg-foreground transition-[width] duration-1000 ease-linear"
                  style={{ width: `${(left / PROMO_SECONDS) * 100}%` }}
                />
              </div>
              {ready ? (
                <a
                  href={href}
                  download
                  onClick={() => setTimeout(() => setOpen(false), 300)}
                  className={`${BUTTON} w-full bg-foreground text-background hover:bg-foreground/90`}
                >
                  <DownloadIcon />
                  {c.download(fileName)}
                </a>
              ) : (
                <button type="button" disabled className={`${BUTTON} w-full cursor-not-allowed bg-foreground/10 text-foreground/50`}>
                  <span aria-live="polite">{c.wait(left)}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
