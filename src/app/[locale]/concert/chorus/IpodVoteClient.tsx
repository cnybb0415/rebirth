"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { chorusDays, VOTE_START, VOTE_END, isVotingOpen, type ChorusSong } from "@/data/chorusSongs";
import s from "./ipod.module.css";

// ── iTunes ──────────────────────────────────────────────
type ItunesInfo = { previewUrl: string | null; artworkUrl: string | null; albumName: string | null };
const itunesCache = new Map<string, ItunesInfo>();

async function fetchItunes(query: string): Promise<ItunesInfo> {
  if (itunesCache.has(query)) return itunesCache.get(query)!;
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&country=kr&limit=1`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = (await res.json()) as { results?: Array<{ previewUrl?: string; artworkUrl100?: string; collectionName?: string }> };
    const track = data.results?.[0];
    const info: ItunesInfo = {
      previewUrl: track?.previewUrl ?? null,
      artworkUrl: track?.artworkUrl100?.replace("100x100", "600x600") ?? null,
      albumName: track?.collectionName ?? null,
    };
    itunesCache.set(query, info);
    return info;
  } catch {
    const info: ItunesInfo = { previewUrl: null, artworkUrl: null, albumName: null };
    itunesCache.set(query, info);
    return info;
  }
}

// ── State ───────────────────────────────────────────────
type Screen =
  | { kind: "menu"; cursor: number }
  | { kind: "list"; dayIdx: number; cursor: number }
  | { kind: "now-playing"; dayIdx: number; songIdx: number; info: ItunesInfo | null; loading: boolean }
  | { kind: "confirm"; dayIdx: number; songIdx: number }
  | { kind: "result"; success: boolean; songTitle: string; dayIdx: number }
  | { kind: "already-voted"; dayIdx: number }
  | { kind: "voting-closed"; dayIdx: number };

// ── Vote countdown ───────────────────────────────────────
function VoteInfoBar() {
  const tc = useTranslations("concert");

  function getCountdown(): string {
    const now = new Date();
    if (now < VOTE_START) {
      const days = Math.ceil((VOTE_START.getTime() - now.getTime()) / 86400000);
      return tc("chorusVote.voteStartsIn", { n: days });
    }
    if (now <= VOTE_END) {
      const diff = VOTE_END.getTime() - now.getTime();
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (d > 0) return tc("chorusVote.voteEndsDay", { d, h });
      if (h > 0) return tc("chorusVote.voteEndsHour", { h, m });
      return tc("chorusVote.voteEndsMin", { m });
    }
    return tc("chorusVote.voteClosed");
  }

  const [text, setText] = useState(() => getCountdown());
  useEffect(() => {
    const id = setInterval(() => setText(getCountdown()), 60000); // eslint-disable-line react-hooks/exhaustive-deps
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={s.voteInfoBar}>
      <div className={s.voteInfoRow}>
        <span className={s.voteInfoLabel}>{tc("chorusVote.periodLabel")}</span>
        <span className={s.voteInfoPeriod}>9/2 12:00 ~ 9/4 23:59</span>
      </div>
      <div className={s.voteInfoRow}>
        <span className={s.voteInfoCountdown}>{text}</span>
      </div>
    </div>
  );
}

// ── Battery / clock display ──────────────────────────────
function useClock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
  useEffect(() => {
    const id = setInterval(
      () => setTime(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })),
      30000
    );
    return () => clearInterval(id);
  }, []);
  return time;
}

// ── Audio hook ───────────────────────────────────────────
function useAudio(src: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setElapsed(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (!src) return;
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.ontimeupdate = () => setElapsed(audio.currentTime);
    audio.onended = () => { setPlaying(false); setElapsed(0); };
    return () => { audio.pause(); audioRef.current = null; };
  }, [src]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { void audio.play(); setPlaying(true); }
  }, [playing]);

  return { playing, elapsed, toggle };
}

// ── Main component ───────────────────────────────────────
export function IpodVoteClient() {
  const [screen, setScreen] = useState<Screen>({ kind: "menu", cursor: 0 });
  const [submitting, setSubmitting] = useState(false);
  const clock = useClock();
  const router = useRouter();
  const locale = useLocale();

  // iTunes data for now-playing screen
  const nowPlayingInfo =
    screen.kind === "now-playing"
      ? { dayIdx: screen.dayIdx, songIdx: screen.songIdx, info: screen.info, loading: screen.loading }
      : null;

  const currentSrc =
    screen.kind === "now-playing" && screen.info?.previewUrl ? screen.info.previewUrl : null;
  const { playing, elapsed, toggle: togglePlay } = useAudio(currentSrc);

  // Load iTunes info when entering now-playing
  useEffect(() => {
    if (screen.kind !== "now-playing" || !screen.loading) return;
    const song = chorusDays[screen.dayIdx]?.songs[screen.songIdx];
    if (!song) return;
    let cancelled = false;
    fetchItunes(song.itunesQuery).then((info) => {
      if (!cancelled) setScreen((prev) =>
        prev.kind === "now-playing" ? { ...prev, info, loading: false } : prev
      );
    });
    return () => { cancelled = true; };
  }, [screen]);

  // ── Navigation handlers ──────────────────────────────
  const goUp = useCallback(() => {
    setScreen((prev) => {
      if (prev.kind === "menu") return { ...prev, cursor: (prev.cursor - 1 + chorusDays.length) % chorusDays.length };
      if (prev.kind === "list") {
        const len = chorusDays[prev.dayIdx]?.songs.length ?? 0;
        return { ...prev, cursor: (prev.cursor - 1 + len) % len };
      }
      return prev;
    });
  }, []);

  const goDown = useCallback(() => {
    setScreen((prev) => {
      if (prev.kind === "menu") return { ...prev, cursor: (prev.cursor + 1) % chorusDays.length };
      if (prev.kind === "list") {
        const len = chorusDays[prev.dayIdx]?.songs.length ?? 0;
        return { ...prev, cursor: (prev.cursor + 1) % len };
      }
      return prev;
    });
  }, []);

  const goMenu = useCallback(() => {
    if (screen.kind === "menu") {
      router.push(`/${locale}/concert/encore`);
      return;
    }
    setScreen((prev) => {
      if (prev.kind === "list") return { kind: "menu", cursor: prev.dayIdx };
      if (prev.kind === "now-playing") return { kind: "list", dayIdx: prev.dayIdx, cursor: prev.songIdx };
      if (prev.kind === "confirm") return { kind: "now-playing", dayIdx: prev.dayIdx, songIdx: prev.songIdx, info: null, loading: true };
      if (prev.kind === "result" || prev.kind === "already-voted" || prev.kind === "voting-closed") return { kind: "list", dayIdx: prev.dayIdx, cursor: 0 };
      return prev;
    });
  }, [screen.kind, router, locale]);

  const goSelect = useCallback(() => {
    setScreen((prev) => {
      if (prev.kind === "menu") return { kind: "list", dayIdx: prev.cursor, cursor: 0 };
      if (prev.kind === "list") return { kind: "now-playing", dayIdx: prev.dayIdx, songIdx: prev.cursor, info: null, loading: true };
      if (prev.kind === "now-playing") return { kind: "confirm", dayIdx: prev.dayIdx, songIdx: prev.songIdx };
      if (prev.kind === "confirm") {
        if (!isVotingOpen()) return { kind: "voting-closed", dayIdx: prev.dayIdx };
        void submitVote(prev.dayIdx, prev.songIdx);
        return prev;
      }
      if (prev.kind === "result" || prev.kind === "already-voted") return { kind: "list", dayIdx: prev.dayIdx, cursor: 0 };
      return prev;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goPrev = useCallback(() => {
    setScreen((prev) => {
      if (prev.kind === "now-playing") {
        const len = chorusDays[prev.dayIdx]?.songs.length ?? 1;
        const nextIdx = (prev.songIdx - 1 + len) % len;
        return { kind: "now-playing", dayIdx: prev.dayIdx, songIdx: nextIdx, info: null, loading: true };
      }
      return prev;
    });
  }, []);

  const goNext = useCallback(() => {
    setScreen((prev) => {
      if (prev.kind === "now-playing") {
        const len = chorusDays[prev.dayIdx]?.songs.length ?? 1;
        const nextIdx = (prev.songIdx + 1) % len;
        return { kind: "now-playing", dayIdx: prev.dayIdx, songIdx: nextIdx, info: null, loading: true };
      }
      return prev;
    });
  }, []);

  async function submitVote(dayIdx: number, songIdx: number) {
    if (submitting) return;
    setSubmitting(true);
    const day = chorusDays[dayIdx];
    const song = day?.songs[songIdx];
    if (!day || !song) { setSubmitting(false); return; }
    try {
      const res = await fetch("/api/chorus-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: day.day, songId: song.id }),
      });
      if (res.status === 409) {
        setScreen({ kind: "already-voted", dayIdx });
      } else if (res.status === 403) {
        setScreen({ kind: "voting-closed", dayIdx });
      } else if (res.ok) {
        setScreen({ kind: "result", success: true, songTitle: song.title, dayIdx });
      } else {
        setScreen({ kind: "result", success: false, songTitle: song.title, dayIdx });
      }
    } catch {
      setScreen({ kind: "result", success: false, songTitle: song?.title ?? "", dayIdx });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Click wheel handler ──────────────────────────────
  function handleWheelClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = e.clientX - rect.left - cx;
    const dy = e.clientY - rect.top - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const outerR = rect.width / 2;

    if (dist > outerR) return;

    // 중앙 원: 반지름의 25% 이내 → 투표/선택
    if (dist < outerR * 0.25) {
      goSelect();
      return;
    }

    const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // -180 to 180
    // 상단 = MENU, 우측 = 다음/아래, 하단 = 재생/일시정지, 좌측 = 이전/위
    if (angle >= -135 && angle < -45) goMenu();
    else if (angle >= -45 && angle < 45) {
      if (screen.kind === "now-playing") goNext(); else goDown();
    }
    else if (angle >= 45 && angle < 135) togglePlay();
    else {
      if (screen.kind === "now-playing") goPrev(); else goUp();
    }
  }

  // Keyboard support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowUp")    { e.preventDefault(); goUp(); }
      if (e.key === "ArrowDown")  { e.preventDefault(); goDown(); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); if (screen.kind === "now-playing") goPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); if (screen.kind === "now-playing") goNext(); }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goSelect(); }
      if (e.key === "Escape" || e.key === "Backspace") { e.preventDefault(); goMenu(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, goUp, goDown, goPrev, goNext, goSelect, goMenu]);

  return (
    <div className={s.ipodWrap}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={s.ipodImg}
        src="/images/concert/encore/sing-along/ipod_screen_transparent.png"
        alt=""
        aria-hidden
      />

      {/* Screen */}
      <div className={s.screen} role="application" aria-label="아이팟 투표">
        <ScreenContent
          screen={screen}
          clock={clock}
          playing={playing}
          elapsed={elapsed}
          submitting={submitting}
          nowPlayingInfo={nowPlayingInfo}
          setScreen={setScreen}
        />
      </div>

      {/* Click wheel */}
      <div
        className={s.wheel}
        onClick={handleWheelClick}
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

// ── Song list screen (needs own hook for scroll) ─────────
function SongListScreen({
  screen,
  clock,
  setScreen,
}: {
  screen: Extract<Screen, { kind: "list" }>;
  clock: string;
  setScreen: React.Dispatch<React.SetStateAction<Screen>>;
}) {
  const tc = useTranslations("concert");
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.children[screen.cursor] as HTMLElement | undefined;
    active?.scrollIntoView({ block: "nearest" });
  }, [screen.cursor]);

  const day = chorusDays[screen.dayIdx];
  const dayLabel = day?.day === 1 ? tc("chorusVote.day1Label") : tc("chorusVote.day2Label");
  return (
    <>
      <TitleBar title={dayLabel} clock={clock} />
      <ul ref={listRef} className={`${s.list} ${s.listScrollable}`}>
        {day?.songs.map((song, i) => (
          <li
            key={song.id}
            className={`${s.listItem} ${s.listItemSong} ${i === screen.cursor ? s.listItemActive : ""}`}
            onClick={() => setScreen({ kind: "now-playing", dayIdx: screen.dayIdx, songIdx: i, info: null, loading: true })}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={s.songThumb}
              src={`/images/concert/cheering/album-art/${song.id}.jpg`}
              alt=""
              onError={(e) => { e.currentTarget.style.opacity = "0"; }}
            />
            <span className={s.songTitleBlock}>
              <span className={s.songTitle}>{song.title}</span>
              <span className={s.songArtist}>{song.artist}</span>
            </span>
            <span className={s.listArrow}>›</span>
          </li>
        ))}
      </ul>
    </>
  );
}

// ── Screen content renderer ──────────────────────────────
function ScreenContent({
  screen,
  clock,
  playing,
  elapsed,
  submitting,
  nowPlayingInfo,
  setScreen,
}: {
  screen: Screen;
  clock: string;
  playing: boolean;
  elapsed: number;
  submitting: boolean;
  nowPlayingInfo: { dayIdx: number; songIdx: number; info: ItunesInfo | null; loading: boolean } | null;
  setScreen: React.Dispatch<React.SetStateAction<Screen>>;
}) {
  const tc = useTranslations("concert");

  if (screen.kind === "menu") {
    return (
      <>
        <TitleBar title="EXhOrizon [dot]" clock={clock} />
        <ul className={s.list}>
          {chorusDays.map((d, i) => (
            <li key={d.day} className={`${s.listItem} ${i === screen.cursor ? s.listItemActive : ""}`}
              onClick={() => setScreen({ kind: "list", dayIdx: i, cursor: 0 })}>
              <span className={s.listLabel}>{d.day === 1 ? tc("chorusVote.day1Label") : tc("chorusVote.day2Label")}</span>
              <span className={s.listDate}>{d.date}</span>
              <span className={s.listArrow}>›</span>
            </li>
          ))}
          {Array.from({ length: Math.max(0, 6 - chorusDays.length) }).map((_, i) => (
            <li key={`empty-${i}`} className={s.listItem} style={{ pointerEvents: "none" }} />
          ))}
        </ul>
        <VoteInfoBar />
      </>
    );
  }

  if (screen.kind === "list") {
    return <SongListScreen screen={screen} clock={clock} setScreen={setScreen} />;
  }

  if (screen.kind === "now-playing") {
    const day = chorusDays[screen.dayIdx];
    const song = day?.songs[screen.songIdx] as ChorusSong | undefined;
    const info = nowPlayingInfo?.info;
    const loading = nowPlayingInfo?.loading ?? false;
    const progress = elapsed / 30;

    const elapsed30 = Math.floor(elapsed);
    const remaining = Math.max(0, 30 - elapsed30);
    const fmtSec = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    return (
      <>
        <TitleBar title={tc("chorusVote.nowPlaying")} clock={clock} />
        <div className={s.nowPlaying}>
          <div className={s.nowPlayingMain}>
            <div className={s.artwork}>
              {loading && <div className={s.artworkLoading} />}
              {!loading && song && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={info?.artworkUrl ?? `/images/concert/cheering/album-art/${song.id}.jpg`}
                  alt={song.title}
                  className={s.artworkImg}
                  onError={(e) => {
                    const img = e.currentTarget;
                    const localSrc = `/images/concert/cheering/album-art/${song.id}.jpg`;
                    if (info?.artworkUrl && !img.dataset.localFallback) {
                      img.dataset.localFallback = "1";
                      img.src = localSrc;
                    } else {
                      img.style.display = "none";
                      (img.nextElementSibling as HTMLElement | null)!.style.display = "flex";
                    }
                  }}
                />
              )}
              {!loading && <div className={s.artworkPlaceholder} style={{ display: "none" }}>♪</div>}
            </div>
            <div className={s.nowPlayingMeta}>
              <p className={s.nowPlayingTitle}>{song?.title}</p>
              <p className={s.nowPlayingArtist}>{song?.artist}</p>
              {info?.albumName && <p className={s.nowPlayingAlbum}>{info.albumName}</p>}
              <p className={s.nowPlayingVoteHint}>{tc("chorusVote.voteHintCenter")}</p>
              <p className={s.nowPlayingVoteHint}>{tc("chorusVote.voteHintPlay")}</p>
            </div>
          </div>
          <div className={s.nowPlayingBottom}>
            <span className={s.nowPlayingTime}>{fmtSec(elapsed30)}</span>
            <div className={s.progressBar}>
              <div className={s.progressFill} style={{ width: `${Math.min(progress * 100, 100)}%` }} />
            </div>
            <span className={s.nowPlayingTime}>-{fmtSec(remaining)}</span>
          </div>
        </div>
      </>
    );
  }

  if (screen.kind === "confirm") {
    const song = chorusDays[screen.dayIdx]?.songs[screen.songIdx];
    return (
      <>
        <TitleBar title={tc("chorusVote.confirmTitle")} clock={clock} />
        <div className={s.centerContent}>
          <p className={s.confirmTitle}>{song?.title}</p>
          <p className={s.confirmSub}>{tc("chorusVote.confirmMsg")}</p>
          <p className={s.confirmHint}>{submitting ? tc("chorusVote.processing") : tc("chorusVote.confirmHint")}</p>
          <p className={s.confirmHint}>{tc("chorusVote.confirmCancel")}</p>
        </div>
      </>
    );
  }

  if (screen.kind === "result") {
    return (
      <>
        <TitleBar title={screen.success ? tc("chorusVote.resultSuccess") : tc("chorusVote.resultError")} clock={clock} />
        <div className={s.centerContent}>
          {screen.success ? (
            <>
              <p className={s.resultIcon}>✓</p>
              <p className={s.confirmTitle}>{screen.songTitle}</p>
              <p className={s.confirmSub}>{tc("chorusVote.resultSuccessMsg")}</p>
            </>
          ) : (
            <>
              <p className={s.resultIcon}>✕</p>
              <p className={s.confirmSub}>{tc("chorusVote.resultErrorMsg")}</p>
              <p className={s.confirmSub}>{tc("chorusVote.resultRetry")}</p>
            </>
          )}
          <p className={s.confirmHint}>{tc("chorusVote.backHint")}</p>
        </div>
      </>
    );
  }

  if (screen.kind === "already-voted") {
    return (
      <>
        <TitleBar title={tc("chorusVote.notice")} clock={clock} />
        <div className={s.centerContent}>
          <p className={s.resultIcon}>!</p>
          <p className={s.confirmSub}>{tc("chorusVote.alreadyVoted")}</p>
          <p className={s.confirmHint}>{tc("chorusVote.backHint")}</p>
        </div>
      </>
    );
  }

  if (screen.kind === "voting-closed") {
    return (
      <>
        <TitleBar title={tc("chorusVote.notice")} clock={clock} />
        <div className={s.centerContent}>
          <p className={s.confirmTitle}>{tc("chorusVote.closedTitle")}</p>
          <p className={s.confirmSub}>9/2 12:00 ~ 9/4 23:59</p>
          <p className={s.confirmHint}>{tc("chorusVote.closedMsg")}</p>
          <p className={s.confirmHint}>{tc("chorusVote.backHint")}</p>
        </div>
      </>
    );
  }

  return null;
}

function TitleBar({ title, clock }: { title: string; clock: string }) {
  return (
    <div className={s.titleBar}>
      <span className={s.titleText}>{title}</span>
      <span className={s.titleClock}>{clock}</span>
      <svg className={s.titleBattery} viewBox="0 0 22 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="19" height="10" rx="2" stroke="currentColor" strokeWidth="1"/>
        <rect x="20" y="3.5" width="2" height="4" rx="0.5" fill="currentColor"/>
        <rect x="1.5" y="1.5" width="15" height="8" rx="1" fill="currentColor"/>
      </svg>
    </div>
  );
}
