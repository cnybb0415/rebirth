"use client";

import { useEffect, useState } from "react";
import { PROMO_SECONDS } from "@/data/labPromos";
import type { LabLang } from "@/data/lab";
import { MamaVoteDialog, GOLD, isMamaVoteOver } from "@/components/MamaVoteDialog";

// EXO.zip 다운로드 버튼: 누르면 MAMA 투표 광고(메인 입장 팝업과 같은 화면)를 10초 보여준 뒤 받기 버튼이 열림
// 투표 기간이 끝나면 광고 없이 바로 받음

const BUTTON =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25";

const COPY = {
  ko: {
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
  const ready = left <= 0;

  // 1초씩 줄어드는 카운트다운
  useEffect(() => {
    if (!open || ready) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [open, ready, left]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // 투표가 끝났으면 광고 없이 바로 받기
  if (isMamaVoteOver()) {
    return (
      <a href={href} download className={`${BUTTON} bg-foreground text-background hover:bg-foreground/90`}>
        <DownloadIcon />
        {label}
      </a>
    );
  }

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
        <MamaVoteDialog
          lang={lang}
          titleId="lab-promo-title"
          onClose={() => setOpen(false)}
          zIndex={70}
          imageMaxH="max-h-[calc(100svh-300px)]"
          howToMaxH="max-h-[calc(100svh-260px)]"
          footer={
            <div className="space-y-2.5 px-4 py-3">
              <p className="flex gap-1.5 text-[11px] leading-snug text-white/55 [&_b]:text-white/85">
                <span aria-hidden>🔒</span>
                <span>{c.security}</span>
              </p>
              <div className="h-1 overflow-hidden rounded-full bg-white/10" aria-hidden>
                <div
                  className="h-full rounded-full transition-[width] duration-1000 ease-linear"
                  style={{ width: `${((PROMO_SECONDS - left) / PROMO_SECONDS) * 100}%`, background: GOLD }}
                />
              </div>
              {ready ? (
                <a
                  href={href}
                  download
                  onClick={() => setTimeout(() => setOpen(false), 300)}
                  className={`${BUTTON} w-full bg-white text-black hover:bg-white/90`}
                >
                  <DownloadIcon />
                  {c.download(fileName)}
                </a>
              ) : (
                <button type="button" disabled className={`${BUTTON} w-full cursor-not-allowed bg-white/10 text-white/50`}>
                  <span aria-live="polite">{c.wait(left)}</span>
                </button>
              )}
            </div>
          }
        />
      )}
    </>
  );
}
