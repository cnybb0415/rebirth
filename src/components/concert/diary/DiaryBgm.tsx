"use client";

import { useEffect, useRef, useState } from "react";
import s from "./diary.module.css";

const SRC = "/audio/diary-peter-pan.mp3";
const VOLUME = 0.55;
const OFF_KEY = "diary-bgm-off"; // 한 번 끈 사람은 다음에 와도 꺼진 채로

function readOff() {
  try {
    return localStorage.getItem(OFF_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * 다이어리 배경음악 (EXO - 피터팬)
 * 들어오면 바로 재생(사이트 안에서 이동해 온 경우). 브라우저가 막으면 처음 화면을 누를 때 시작. 소리는 천천히 키움.
 * 오른쪽 아래 버튼으로 끄고 켤 수 있음.
 */
export function DiaryBgm() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const fadeTo = (audio: HTMLAudioElement, target: number, ms: number, done?: () => void) => {
    const from = audio.volume;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      audio.volume = from + (target - from) * k;
      if (k < 1) requestAnimationFrame(step);
      else done?.();
    };
    requestAnimationFrame(step);
  };

  const getAudio = () => {
    if (!audioRef.current) {
      const a = new Audio(SRC);
      a.loop = true;
      a.preload = "auto";
      a.volume = 0;
      a.onplay = () => setPlaying(true);
      a.onpause = () => setPlaying(false);
      audioRef.current = a;
    }
    return audioRef.current;
  };

  const play = () => {
    const a = getAudio();
    a.volume = 0;
    return a.play().then(() => fadeTo(a, VOLUME, 1500));
  };

  const stop = () => {
    const a = audioRef.current;
    if (!a) return;
    fadeTo(a, 0, 400, () => a.pause());
  };

  // 들어오자마자 자동재생 시도 → 브라우저가 막으면(링크·주소로 바로 들어온 경우) 첫 터치·클릭·키 입력에서 시작
  // (끈 적 있으면 시작 안 함)
  useEffect(() => {
    if (readOff()) return;
    let cancelled = false;
    const start = () => {
      remove();
      if (audioRef.current && !audioRef.current.paused) return;
      play().catch(() => {});
    };
    const remove = () => {
      window.removeEventListener("pointerdown", start, true);
      window.removeEventListener("keydown", start, true);
    };
    window.addEventListener("pointerdown", start, true);
    window.addEventListener("keydown", start, true);
    play()
      .then(() => remove())
      .catch(() => {
        if (cancelled) remove();
      });
    return () => {
      cancelled = true;
      remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 화면을 떠나면 멈춤, 다른 탭으로 가면 잠시 멈췄다가 돌아오면 다시
  useEffect(() => {
    let resume = false;
    const onVis = () => {
      const a = audioRef.current;
      if (!a) return;
      if (document.hidden) {
        resume = !a.paused;
        a.pause();
      } else if (resume) {
        play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      audioRef.current?.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.setItem(OFF_KEY, playing ? "1" : "0");
    } catch {}
    if (playing) stop();
    else play().catch(() => {});
  };

  return (
    <button
      type="button"
      className={`${s.bgm} ${playing ? s.bgmOn : ""}`}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "배경음악 끄기 (EXO - 피터팬)" : "배경음악 켜기 (EXO - 피터팬)"}
      title="EXO - 피터팬"
    >
      <span className={s.bgmIcon} aria-hidden>
        {playing ? (
          <>
            <i /> <i /> <i />
          </>
        ) : (
          "♪"
        )}
      </span>
      <span className={s.bgmLabel}>Peter Pan</span>
    </button>
  );
}
