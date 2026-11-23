"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

// 크라운 뮤비 2:51~3:11 구간을 소리 없이 반복 재생하는 홈 배경
const START = 171;
const END = 191;

export function CrownHero() {
  const [ready, setReady] = useState(false);
  const id = siteConfig.youtube.videoId;
  const src =
    `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}` +
    `&start=${START}&end=${END}&playsinline=1&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3`;

  // 영상이 뜨기 전까지는 같은 장면 사진을 보여줌
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className="relative aspect-video w-full overflow-hidden bg-black lg:mx-auto lg:max-w-6xl lg:rounded-b-3xl">
      <iframe
        src={src}
        title="EXO Crown MV"
        allow="autoplay; encrypted-media"
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 h-full w-full border-0"
      />
      <img
        src="/images/home/crown_poster.jpg"
        alt=""
        aria-hidden
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#060608] to-transparent" />
    </section>
  );
}
