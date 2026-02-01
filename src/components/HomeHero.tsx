"use client";

import { useEffect, useRef, useState } from "react";

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
      } else if (delta > 4) {
        setHidden(true);
      } else if (delta < -4) {
        setHidden(false);
      }

      lastY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const target = () => document.getElementById("home-latest");
    const trySnap = () => {
      if (isSnapping.current) return;
      if (window.scrollY > 120) return;
      const el = target();
      if (!el) return;
      isSnapping.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        isSnapping.current = false;
      }, 700);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) trySnap();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
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
          "sticky top-14 w-full transition-transform duration-300 ease-out " +
          (hidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100")
        }
      >
        <div className="group relative w-full overflow-hidden">
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
        </div>
      </div>
    </div>
  );
}
