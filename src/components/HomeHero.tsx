"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";

const HERO_IMAGES = [
  "/images/home/1.%EB%8B%A8%EC%B2%B4.png",
  "/images/home/2.%EB%8B%A8%EC%B2%B4.png",
];

export function HomeHero() {
  const [hidden, setHidden] = useState(false);
  const [index, setIndex] = useState(0);
  const lastY = useRef(0);
  const isSnapping = useRef(false);
  const total = HERO_IMAGES.length;

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY.current;

      if (currentY <= 10) {
        setHidden(false);
      } else if (delta < -4) {
        setHidden(false);
      }

      lastY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const target = () => document.getElementById("home-quickview");
    const wheelCount = { current: 0 };
    const hideCount = { current: 0 };
    let resetTimer: number | null = null;
    const trySnap = () => {
      if (isSnapping.current) return;
      if (window.scrollY > 120) return;
      const el = target();
      if (!el) return;
      isSnapping.current = true;
      wheelCount.current = 0;
      hideCount.current = 0;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        isSnapping.current = false;
      }, 700);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY <= 0) return;
      if (window.scrollY <= 10) {
        hideCount.current = 0;
      }
      if (window.scrollY > 10) {
        hideCount.current += 1;
        if (hideCount.current >= 2) {
          setHidden(true);
        }
      }

      if (window.scrollY > 120) return;
      wheelCount.current += 1;
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        wheelCount.current = 0;
        hideCount.current = 0;
      }, 800);
      if (wheelCount.current >= 2) trySnap();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (resetTimer) window.clearTimeout(resetTimer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [total]);

  const goPrev = () => {
    if (!total) return;
    setIndex((prev) => (prev - 1 + total) % total);
  };

  const goNext = () => {
    if (!total) return;
    setIndex((prev) => (prev + 1) % total);
  };

  return (
    <div className="relative w-full">
      <div
        className={
          "sticky top-14 w-full overflow-hidden transition-[max-height,opacity] duration-300 ease-out " +
          (hidden ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100")
        }
      >
        <div className="px-3 pt-3 sm:px-5 sm:pt-5">
        <div className="group relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px]">
          <div
            className="flex w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {HERO_IMAGES.map((src) => (
              <div key={src} className="relative w-full shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="홈 배너" className="w-full h-auto" />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={goPrev}
            aria-label="이전 이미지"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <span className="block text-sm">‹</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="다음 이미지"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <span className="block text-sm">›</span>
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={`hero-dot-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`이미지 ${i + 1} 보기`}
                className={
                  "h-2 w-2 rounded-full border border-white/40 transition" +
                  (i === index ? " bg-white" : " bg-transparent")
                }
              />
            ))}
          </div>

          {/* 에디토리얼 오버레이: 세로 그리드선 + 문구 (사진 위, 클릭은 통과) */}
          <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-4">
            <span className="border-r border-white/15" />
            <span className="border-r border-white/15" />
            <span className="border-r border-white/15" />
            <span />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 text-white sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <p className="font-display text-[22px] italic leading-none sm:text-[32px]">Re:Birth.</p>
              <p className="max-w-[9rem] text-right text-[10px] font-medium uppercase leading-snug tracking-[0.14em] text-white/80 sm:max-w-none sm:text-[11px]">
                EXO supporting fanbase
              </p>
            </div>
            <div className="flex items-end justify-between gap-4 pb-5 sm:pb-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 sm:text-[11px]">
                  {siteConfig.artistName} — Now streaming
                </p>
                <p className="font-display mt-1 text-[56px] leading-[0.85] sm:text-[112px]">{siteConfig.trackTitle}</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
