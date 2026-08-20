"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import s from "./cheer-select.module.css";

type Song = {
  id: string;
  label: string;
  slug: string;
  coverSrc?: string | null;
  hasGuide: boolean;
  youtubeUrl?: string | null;
};

export function CheerSelectClient({ songs, preparingLabel }: { songs: Song[]; preparingLabel: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const router = useRouter();
  const locale = useLocale();

  const active = songs[activeIdx];

  const go = (song: Song) => {
    if (song.hasGuide) router.push(`/${locale}/concert/cheer/${encodeURIComponent(song.slug)}`);
  };

  return (
    <div className={s.container}>
      {/* Header */}
      <p className={s.header}>♦ SELECT YOUR SONG ♦</p>

      {/* Main layout */}
      <div className={s.layout}>
        {/* Left: song list */}
        <ul className={s.list}>
          {songs.map((song, i) => {
            const isActive = i === activeIdx;
            return (
              <li
                key={song.id}
                className={`${s.item} ${isActive ? s.itemActive : ""} ${!song.hasGuide ? s.itemLocked : ""}`}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => go(song)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") go(song);
                  if (e.key === "ArrowDown") setActiveIdx((i + 1) % songs.length);
                  if (e.key === "ArrowUp") setActiveIdx((i - 1 + songs.length) % songs.length);
                }}
                tabIndex={0}
              >
                <span className={s.cursor} aria-hidden>►</span>
                <span className={s.songName}>{song.label}</span>
                {!song.hasGuide && <span className={s.lock}>{preparingLabel}</span>}
              </li>
            );
          })}
        </ul>

        {/* Right: album art */}
        <div className={s.preview}>
          <div className={s.previewFrame}>
            <span className={`${s.corner} ${s.cornerTL}`} aria-hidden />
            <span className={`${s.corner} ${s.cornerTR}`} aria-hidden />
            <span className={`${s.corner} ${s.cornerBL}`} aria-hidden />
            <span className={`${s.corner} ${s.cornerBR}`} aria-hidden />
            {active.coverSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={active.id}
                src={active.coverSrc}
                alt={active.label}
                className={s.previewImg}
              />
            ) : (
              <div className={s.previewEmpty} />
            )}
          </div>
          <p className={s.previewName}>{active.label}</p>
        </div>
      </div>

      {/* Bottom prompt */}
      <p className={s.prompt}>
        {active.hasGuide ? "— PRESS START —" : "— COMING SOON —"}
      </p>
    </div>
  );
}
