"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";

// 크라운 뮤비 2:51~3:11 구간을 소리 없이 반복 재생하는 홈 배경
// 영상이 실제로 재생 중일 때만 보이고, 그 전(로딩)·반복 사이·자동재생이 막힌 경우에는 같은 장면 사진을 보여줌
// → 유튜브 자체 썸네일·재생 버튼·제목이 보이지 않음
const START = 171;
const END = 191;

export function CrownHero() {
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const id = siteConfig.youtube.videoId;
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    // origin을 넣어야 유튜브가 재생 상태를 알려줌
    setSrc(
      `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}` +
        `&start=${START}&end=${END}&playsinline=1&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3` +
        `&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`,
    );
  }, [id]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin)) return;
      if (e.source !== frameRef.current?.contentWindow) return;
      let data: { event?: string; info?: unknown };
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      // 1 = 재생 중. 그 밖(버퍼링·끝남·멈춤)에는 사진으로 덮음
      const state =
        data.event === "onStateChange"
          ? data.info
          : data.event === "infoDelivery" && data.info && typeof data.info === "object"
            ? (data.info as { playerState?: number }).playerState
            : undefined;
      if (typeof state === "number") setPlaying(state === 1);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // 플레이어가 준비되면 상태를 알려달라고 요청
  const onLoad = () => {
    frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: "crown" }), "*");
  };

  return (
    <section className="relative aspect-video w-full overflow-hidden bg-black lg:mx-auto lg:max-w-6xl lg:rounded-b-3xl">
      {src ? (
        <iframe
          ref={frameRef}
          src={src}
          onLoad={onLoad}
          title="EXO Crown MV"
          allow="autoplay; encrypted-media"
          tabIndex={-1}
          className="pointer-events-none absolute inset-0 h-full w-full border-0"
        />
      ) : null}
      <img
        src="/images/home/crown_poster.jpg"
        alt=""
        aria-hidden
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${playing ? "opacity-0" : "opacity-100"}`}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#060608] to-transparent" />
    </section>
  );
}
