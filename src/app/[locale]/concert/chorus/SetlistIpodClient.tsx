"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { exhorizonSetlist, type SetlistSong } from "@/data/setlistData";
import s from "./ipod.module.css";

// 이 4곡은 아이팟 스크린 전체 풀스크린
const FULLSCREEN_IDS = new Set(["overdose", "crazy", "crown", "back-it-up"]);

// ── YouTube IFrame API ────────────────────────────────────
declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: {
        videoId: string;
        width?: string | number;
        height?: string | number;
        playerVars?: Record<string, string | number>;
        events?: {
          onReady?: (e: { target: YTPlayer }) => void;
          onStateChange?: (e: { data: number }) => void;
        };
      }) => YTPlayer;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}
interface YTPlayer {
  getIframe(): HTMLIFrameElement;
  loadVideoById(id: string): void;
  destroy(): void;
}

function loadYTScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  return new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
}

const items = exhorizonSetlist.items;

type Screen =
  | { kind: "list"; cursor: number }
  | { kind: "playing"; itemIdx: number };

function useClock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
  );
  useEffect(() => {
    const id = setInterval(
      () => setTime(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })),
      30000
    );
    return () => clearInterval(id);
  }, []);
  return time;
}

function TitleBar({ title, clock }: { title: string; clock: string }) {
  return (
    <div className={s.titleBar}>
      <span className={s.titleText}>{title}</span>
      <span className={s.titleClock}>{clock}</span>
      <svg className={s.titleBattery} viewBox="0 0 22 11" fill="none">
        <rect x="0.5" y="0.5" width="19" height="10" rx="2" stroke="currentColor" strokeWidth="1"/>
        <rect x="20" y="3.5" width="2" height="4" rx="0.5" fill="currentColor"/>
        <rect x="1.5" y="1.5" width="15" height="8" rx="1" fill="currentColor"/>
      </svg>
    </div>
  );
}

export function SetlistIpodClient() {
  const [screen, setScreen] = useState<Screen>({ kind: "list", cursor: 0 });
  const clock = useClock();
  const listRef = useRef<HTMLUListElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const router = useRouter();
  const locale = useLocale();
  const screenRef = useRef(screen);
  useLayoutEffect(() => { screenRef.current = screen; });

  // ── Navigation ────────────────────────────────────────────
  const goNext = useCallback(() => {
    setScreen((prev) => {
      if (prev.kind !== "playing") return prev;
      for (let i = prev.itemIdx + 1; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "song" && item.youtubeId) return { kind: "playing", itemIdx: i };
      }
      return prev;
    });
  }, []);

  const goPrev = useCallback(() => {
    setScreen((prev) => {
      if (prev.kind !== "playing") return prev;
      for (let i = prev.itemIdx - 1; i >= 0; i--) {
        const item = items[i];
        if (item.kind === "song" && item.youtubeId) return { kind: "playing", itemIdx: i };
      }
      return prev;
    });
  }, []);

  // 리스트: break 항목 스킵하며 이동
  const goUp = useCallback(() => {
    setScreen((prev) => {
      if (prev.kind !== "list") return prev;
      let cursor = (prev.cursor - 1 + items.length) % items.length;
      let guard = 0;
      while (items[cursor]?.kind === "break" && guard++ < items.length) {
        cursor = (cursor - 1 + items.length) % items.length;
      }
      return { ...prev, cursor };
    });
  }, []);

  const goDown = useCallback(() => {
    setScreen((prev) => {
      if (prev.kind !== "list") return prev;
      let cursor = (prev.cursor + 1) % items.length;
      let guard = 0;
      while (items[cursor]?.kind === "break" && guard++ < items.length) {
        cursor = (cursor + 1) % items.length;
      }
      return { ...prev, cursor };
    });
  }, []);

  const goBack = useCallback(() => {
    const s = screenRef.current;
    if (s.kind === "playing") {
      setScreen({ kind: "list", cursor: s.itemIdx });
      return;
    }
    router.push(`/${locale}/concert/chorus`);
  }, [router, locale]);

  const goSelect = useCallback(() => {
    const s = screenRef.current;
    if (s.kind === "playing") {
      const item = items[s.itemIdx];
      if (item?.kind === "song") {
        window.open(`https://www.youtube.com/watch?v=${item.youtubeId}`, "_blank");
      }
      return;
    }
    if (s.kind === "list") {
      const item = items[s.cursor];
      if (!item || item.kind === "break" || !item.youtubeId) return;
      setScreen({ kind: "playing", itemIdx: s.cursor });
    }
  }, []);

  // ── YouTube IFrame API player ─────────────────────────────
  // 앱 마운트 시 YT 스크립트 로드
  useEffect(() => { loadYTScript(); }, []);

  const activeIdx = screen.kind === "playing" ? screen.itemIdx : -1;
  const activeFullscreen = activeIdx >= 0 && FULLSCREEN_IDS.has(
    (items[activeIdx] as SetlistSong | undefined)?.id ?? ""
  );

  useEffect(() => {
    if (activeIdx < 0) {
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
      return;
    }
    const song = items[activeIdx];
    if (!song || song.kind !== "song") return;
    const videoId = song.youtubeId;

    const initPlayer = () => {
      const container = playerContainerRef.current;
      if (!container) return;
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = new window.YT.Player(container, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: activeFullscreen ? 1 : 0,
        },
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) goNext();
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      loadYTScript().then(initPlayer);
    }

    return () => {
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, goNext]);

  // ── Scroll active into view ───────────────────────────────
  useEffect(() => {
    if (screen.kind !== "list") return;
    const list = listRef.current;
    if (!list) return;
    const active = list.children[screen.cursor] as HTMLElement | undefined;
    active?.scrollIntoView({ block: "nearest" });
  }, [screen]);

  // ── Keyboard ─────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowUp")    { e.preventDefault(); goUp(); }
      if (e.key === "ArrowDown")  { e.preventDefault(); goDown(); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goSelect(); }
      if (e.key === "Escape" || e.key === "Backspace") { e.preventDefault(); goBack(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goUp, goDown, goPrev, goNext, goSelect, goBack]);

  // ── Clickwheel ────────────────────────────────────────────
  function fireWheelTap(clientX: number, clientY: number, target: Element) {
    const rect = target.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = clientX - rect.left - cx;
    const dy = clientY - rect.top - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const outerR = rect.width / 2;
    if (dist > outerR) return;
    if (dist < outerR * 0.25) { goSelect(); return; }
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const sk = screenRef.current.kind;
    if (angle >= -135 && angle < -45) goBack();
    else if (angle >= -45 && angle < 45) { if (sk === "playing") goNext(); else goDown(); }
    else if (angle >= 45 && angle < 135) { /* 하단: 없음 */ }
    else { if (sk === "playing") goPrev(); else goUp(); }
  }

  const dragRef = useRef<{ startX: number; startY: number; lastAngle: number; accum: number; moved: boolean } | null>(null);
  function getAngle(rect: DOMRect, x: number, y: number) {
    return Math.atan2(y - (rect.top + rect.height / 2), x - (rect.left + rect.width / 2)) * (180 / Math.PI);
  }
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      lastAngle: getAngle(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY),
      accum: 0, moved: false,
    };
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
    if (Math.sqrt(dx * dx + dy * dy) > 6) drag.moved = true;
    if (!drag.moved) return;
    const angle = getAngle(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY);
    let delta = angle - drag.lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    drag.accum += delta;
    drag.lastAngle = angle;
    const STEP = 18;
    const sk = screenRef.current.kind;
    while (drag.accum >= STEP)  { drag.accum -= STEP; if (sk === "playing") goNext(); else goDown(); }
    while (drag.accum <= -STEP) { drag.accum += STEP; if (sk === "playing") goPrev(); else goUp(); }
  }
  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current; dragRef.current = null;
    if (!drag) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!drag.moved) fireWheelTap(e.clientX, e.clientY, e.currentTarget);
  }

  // ── Derived ───────────────────────────────────────────────
  const currentSong =
    screen.kind === "playing" && items[screen.itemIdx]?.kind === "song"
      ? (items[screen.itemIdx] as SetlistSong)
      : null;
  const isFullScreen = currentSong ? FULLSCREEN_IDS.has(currentSong.id) : false;

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={s.ipodWrap}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={s.ipodImg}
        src="/images/concert/encore/sing-along/ipod_screen_transparent.png"
        alt="" aria-hidden
      />

      <div className={s.screen} role="application" aria-label="셋리스트 플레이어">

        {/* ── 리스트 화면 ── */}
        {screen.kind === "list" && (
          <>
            <TitleBar title={exhorizonSetlist.label} clock={clock} />
            <ul ref={listRef} className={`${s.list} ${s.listScrollable}`}>
              {items.map((item, i) => {
                const isBreak = item.kind === "break";
                const song = item.kind === "song" ? item : null;
                const active = i === screen.cursor;
                return (
                  <li
                    key={item.id}
                    className={`${s.listItem} ${active ? s.listItemActive : ""} ${!isBreak ? s.listItemSong : ""}`}
                    style={isBreak ? { opacity: 0.35, pointerEvents: "none" } : {}}
                    onClick={isBreak || !song?.youtubeId ? undefined
                      : () => setScreen({ kind: "playing", itemIdx: i })}
                  >
                    {!isBreak && song && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        className={s.songThumb}
                        src={`https://img.youtube.com/vi/${song.thumbnailId ?? song.youtubeId}/mqdefault.jpg`}
                        alt=""
                        aria-hidden
                      />
                    )}
                    <div className={!isBreak ? s.songTitleBlock : undefined} style={isBreak ? { flex: 1 } : undefined}>
                      <span className={!isBreak ? s.songTitle : s.listLabel} style={isBreak ? { fontStyle: "italic" } : undefined}>
                        {isBreak ? item.label : song?.title}
                      </span>
                      {!isBreak && <span className={s.songArtist}>{song?.note ?? song?.artist}</span>}
                    </div>
                    {!isBreak && <span className={s.listArrow}>›</span>}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* ── 재생 화면 ── */}
        {screen.kind === "playing" && currentSong && (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#000" }}>

            {/* 풀스크린: 중독/Crazy/Crown/Back It Up */}
            {isFullScreen && (
              <div ref={playerContainerRef} style={{ width: "100%", height: "100%", display: "block" }} />
            )}

            {/* 아트워크 자리에 YouTube 1:1 크롭 */}
            {!isFullScreen && (
              <>
                <TitleBar title={currentSong.title} clock={clock} />
                <div className={s.nowPlaying} style={{ background: "#fff" }}>
                  <div className={s.nowPlayingMain}>
                    {/* 아트워크 위치: YouTube 1:1 크롭 */}
                    <div
                      className={s.artwork}
                      style={{ overflow: "hidden", background: "#000", transform: "none", boxShadow: "none" }}
                    >
                      <div
                        ref={playerContainerRef}
                        style={{
                          position: "absolute",
                          top: "50%", left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "178%",
                          aspectRatio: "16/9",
                        }}
                      />
                    </div>

                    {/* 메타 정보 */}
                    <div className={s.nowPlayingMeta}>
                      <p className={s.nowPlayingTitle}>{currentSong.title}</p>
                      <p className={s.nowPlayingArtist}>{currentSong.artist}</p>
                      {currentSong.note && <p className={s.nowPlayingAlbum}>{currentSong.note}</p>}
                      <p className={s.nowPlayingVoteHint}>● CENTER → YouTube</p>
                      <p className={s.nowPlayingVoteHint}>► MENU → 뒤로</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Click wheel */}
      <div
        className={s.wheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { dragRef.current = null; }}
        onContextMenu={(e) => e.preventDefault()}
        role="group"
        aria-label="클릭 휠"
      >
        <div className={s.wheelCenter} />
        <span className={s.wheelTop}>MENU</span>
        <span className={s.wheelLeft}>|◄◄</span>
        <span className={s.wheelRight}>►►|</span>
        <span className={s.wheelBottom}>►II</span>
      </div>
    </div>
  );
}
