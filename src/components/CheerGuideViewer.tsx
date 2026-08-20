"use client";

import { useState } from "react";
import type { LangKey, CheeringSongAsset } from "@/lib/cheering-types";
import s from "./cheer-guide.module.css";

const LANG_SHORT: Record<LangKey, string> = {
  ko: "KO", en: "EN", cn: "CN", jp: "JP",
};

const LANG_ORDER: LangKey[] = ["ko", "en", "cn", "jp"];

const LOCALE_TO_LANG: Record<string, LangKey> = {
  ko: "ko", en: "en", zh: "cn", ja: "jp",
};

interface Props {
  guideByLang: Record<LangKey, CheeringSongAsset[]>;
  songLabel: string;
  locale?: string;
  embedUrl?: string | null;
  backHref?: string;
}

export function CheerGuideViewer({ guideByLang, songLabel, locale, embedUrl, backHref }: Props) {
  const availableLangs = LANG_ORDER.filter((l) => guideByLang[l].length > 0);
  const preferredLang = locale ? (LOCALE_TO_LANG[locale] ?? "ko") : "ko";
  const defaultLang: LangKey = availableLangs.includes(preferredLang)
    ? preferredLang
    : (availableLangs[0] ?? "ko");

  const [activeLang, setActiveLang] = useState<LangKey>(defaultLang);
  const [idx, setIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(!!embedUrl);
  const [videoMinimized, setVideoMinimized] = useState(false);

  const assets: CheeringSongAsset[] = guideByLang[activeLang] ?? [];
  const total = assets.length;
  const current = assets[idx];

  const switchLang = (lang: LangKey) => {
    setActiveLang(lang);
    setIdx(0);
  };

  return (
    <div className={s.viewer}>
      {/* Guide window */}
      <div className={s.window}>
          {/* Title bar */}
          <div className={s.titleBar}>
            <span className={s.titleIcon} aria-hidden>♥</span>
            <span className={s.titleText}>{songLabel}</span>
            <div className={s.winBtns}>
              <span className={s.winBtn} aria-hidden>─</span>
              <span className={s.winBtn} aria-hidden>□</span>
              {backHref ? (
                <a href={backHref} className={`${s.winBtn} ${s.winBtnClose}`} aria-label="목록으로">✕</a>
              ) : (
                <span className={`${s.winBtn} ${s.winBtnClose}`} aria-hidden>✕</span>
              )}
            </div>
          </div>

          {/* Menu bar */}
          <div className={s.menuBar}>
            {backHref && (
              <a href={backHref} className={s.menuItem}>← LIST</a>
            )}
            <span className={`${s.menuItem} ${s.menuItemActive}`}>GUIDE</span>
            {availableLangs.length > 1 && availableLangs.map((lang) => (
              <button
                key={lang}
                className={`${s.menuItem} ${activeLang === lang ? s.menuItemOn : ""}`}
                onClick={() => switchLang(lang)}
              >
                {LANG_SHORT[lang]}
              </button>
            ))}
            {embedUrl && (
              <button
                className={`${s.menuItem} ${s.menuItemVideo}`}
                onClick={() => setShowVideo((v) => !v)}
              >
                {showVideo ? "✕ VIDEO" : "▶ VIDEO"}
              </button>
            )}
          </div>

          {/* Canvas area */}
          <div className={s.canvas}>
            {total === 0 ? (
              <div className={s.comingSoon}>COMING SOON</div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${activeLang}-${idx}`}
                src={current.src}
                alt={current.alt ?? `${songLabel} 응원법`}
                className={s.guideImg}
                loading="lazy"
              />
            )}
          </div>

          {/* Navigation */}
          {total > 1 && (
            <div className={s.navArea}>
              <button
                className={s.navBtn}
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
                aria-label="이전"
              >
                ◄ PREV
              </button>
              <span className={s.pageInfo}>
                {Array.from({ length: total }).map((_, i) => (
                  <span key={i} className={i === idx ? s.dotOn : s.dotOff} aria-hidden>●</span>
                ))}
                <span className={s.pageNum}>{idx + 1} / {total}</span>
              </span>
              <button
                className={s.navBtn}
                onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
                disabled={idx === total - 1}
                aria-label="다음"
              >
                NEXT ►
              </button>
            </div>
          )}
      </div>

      {/* Video floating window */}
      {showVideo && embedUrl && (
        <div className={s.videoSide}>
          <div className={s.videoTitleBar}>
            <span className={s.titleIcon} aria-hidden>▶</span>
            <span className={s.titleText}>PRACTICE VIDEO</span>
            <div className={s.winBtns}>
              <button
                className={`${s.winBtn} ${s.winBtnActive}`}
                onClick={() => setVideoMinimized(true)}
                aria-label="최소화"
                disabled={videoMinimized}
              >
                ─
              </button>
              <button
                className={`${s.winBtn} ${s.winBtnActive}`}
                onClick={() => setVideoMinimized(false)}
                aria-label="복원"
                disabled={!videoMinimized}
              >
                □
              </button>
              <button
                className={`${s.winBtn} ${s.winBtnClose}`}
                onClick={() => setShowVideo(false)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
          </div>
          {!videoMinimized && (
            <div className={s.videoInset}>
              <iframe
                className={s.playerIframe}
                src={embedUrl}
                title={`${songLabel} YouTube`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
