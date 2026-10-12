"use client";

import { useEffect, useRef, type RefObject } from "react";

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          width?: string | number;
          height?: string | number;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YTPlayer {
  getIframe(): HTMLIFrameElement;
  loadVideoById(id: string): void;
  destroy(): void;
}

let ytScriptPromise: Promise<void> | null = null;
function loadYTScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytScriptPromise) return ytScriptPromise;
  ytScriptPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return ytScriptPromise;
}

/**
 * YouTube IFrame API 플레이어를 containerRef 안에 생성/정리.
 * containerRef에 직접 전달하지 않고 내부 target을 따로 만드는 이유:
 * YT API가 전달받은 요소를 iframe으로 "교체(replace)"해버려서, React가
 * 관리하는 containerRef를 그대로 넘기면 나중에 React가 unmount할 때
 * "removeChild: not a child of this node" 에러가 남.
 */
export function useYouTubePlayer({
  containerRef,
  videoId,
  controls = false,
  onEnded,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  videoId: string | null;
  controls?: boolean;
  onEnded?: () => void;
}) {
  const playerRef = useRef<YTPlayer | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    if (!videoId) {
      try { playerRef.current?.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
      return;
    }
    let cancelled = false;

    const initPlayer = () => {
      if (cancelled) return;
      const wrapper = containerRef.current;
      if (!wrapper) return;
      try { playerRef.current?.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
      wrapper.innerHTML = "";
      const target = document.createElement("div");
      wrapper.appendChild(target);
      playerRef.current = new window.YT.Player(target, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: controls ? 1 : 0,
        },
        events: {
          onStateChange: (e) => {
            if (e.data === 0 /* YT.PlayerState.ENDED */) onEndedRef.current?.();
          },
        },
      });
    };

    if (window.YT?.Player) initPlayer();
    else loadYTScript().then(initPlayer);

    return () => {
      cancelled = true;
      try { playerRef.current?.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, controls]);
}
