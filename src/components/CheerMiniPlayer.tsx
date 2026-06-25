"use client";

import { useState } from "react";

type CheerMiniPlayerProps = {
  songLabel: string;
  embedUrl: string;
};

export function CheerMiniPlayer({ songLabel, embedUrl }: CheerMiniPlayerProps) {
  const [minimized, setMinimized] = useState(false);

  return (
    <>
      {minimized ? (
        <div className="fixed bottom-24 left-4 z-[60] flex h-10 w-[190px] items-center justify-between rounded-xl border border-foreground/15 bg-white px-3 shadow-xl sm:w-[220px]">
          <div className="truncate text-xs font-semibold text-foreground/80">{songLabel}</div>
          <button
            type="button"
            onClick={() => setMinimized(false)}
            className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-md border border-foreground/15 text-sm text-foreground/80 hover:bg-foreground/5"
            aria-label="플레이어 펼치기"
          >
            +
          </button>
        </div>
      ) : null}

      <div
        className={`fixed bottom-24 left-4 z-[60] w-[200px] overflow-hidden rounded-2xl border border-foreground/15 bg-white shadow-xl transition-opacity sm:w-[230px] ${
          minimized ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <div className="truncate text-xs font-semibold text-foreground/80">{songLabel}</div>
          <button
            type="button"
            onClick={() => setMinimized(true)}
            className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-md border border-foreground/15 text-sm text-foreground/80 hover:bg-foreground/5"
            aria-label="플레이어 최소화"
          >
            -
          </button>
        </div>
        <div className="relative h-[112px] w-full sm:h-[129px]">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={embedUrl}
            title={`${songLabel} YouTube player`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </>
  );
}
