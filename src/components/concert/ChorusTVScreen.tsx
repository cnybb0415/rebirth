"use client";

import { useState } from "react";

const ACCENT = "#00e5ff";

const PIXEL_FONT: React.CSSProperties = {
  fontFamily: "'Mulmaru', 'PFStarDust', monospace",
  WebkitFontSmoothing: "none",
};

type Lang = "ko" | "en" | "cn" | "jp";
const LANG_LABELS: Record<Lang, string> = { ko: "한국어", en: "English", cn: "中文", jp: "日本語" };

const DAYS = [
  {
    label: "DAY 1",
    videoId: "vF6J3T1I5gU",
    imgs: {
      ko: "/images/concert/sing-along/DAY1/run_ko.png",
      en: "/images/concert/sing-along/DAY1/run_en.png",
      cn: "/images/concert/sing-along/DAY1/run_cn.png",
      jp: "/images/concert/sing-along/DAY1/run_jp.png",
    },
  },
  {
    label: "DAY 2",
    videoId: "FlTw8m_gnrU",
    imgs: {
      ko: "/images/concert/sing-along/DAY2/baby_ko.png",
      en: "/images/concert/sing-along/DAY2/baby_en.png",
      cn: "/images/concert/sing-along/DAY2/baby_cn.png",
      jp: "/images/concert/sing-along/DAY2/baby_jp.png",
    },
  },
  {
    label: "DAY 3",
    videoId: null as string | null,
    imgs: {
      ko: "/images/concert/sing-along/DAY3/flatline_ko.png",
      en: "/images/concert/sing-along/DAY3/flatline_en.png",
      cn: "/images/concert/sing-along/DAY3/flatline_cn.png",
      jp: "/images/concert/sing-along/DAY3/flatline_jp.png",
    },
  },
] as const;

type DayIdx = 0 | 1 | 2;

export function ChorusTVScreen() {
  const [selectedDay, setSelectedDay] = useState<DayIdx | null>(null);
  const [pressed, setPressed] = useState<DayIdx | null>(null);
  const [lang, setLang] = useState<Lang>("ko");

  const currentDay = selectedDay !== null ? DAYS[selectedDay] : null;
  const embedUrl =
    currentDay?.videoId
      ? `https://www.youtube.com/embed/${currentDay.videoId}?autoplay=0&rel=0`
      : null;

  return (
    <>
      <style>{`
        @keyframes chorus-pulse {
          0%, 100% { opacity: 1; text-shadow: 0 0 20px ${ACCENT}, 0 0 40px ${ACCENT}88; }
          50% { opacity: 0.65; text-shadow: 0 0 8px ${ACCENT}66; }
        }
        @keyframes chorus-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
          padding: "4px 0 8px",
        }}
      >
        {/* ══ TV Frame ══ */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "560px",
            background: "linear-gradient(160deg, #0d1220 0%, #080d18 100%)",
            border: `2.5px solid ${ACCENT}55`,
            borderRadius: "14px",
            boxShadow: `0 0 32px ${ACCENT}22, 0 12px 48px rgba(0,0,0,0.85), inset 0 1px 0 rgba(0,229,255,0.08)`,
            padding: "14px 14px 10px",
          }}
        >
          {/* Corner brackets */}
          <div style={{ position: "absolute", top: "7px", left: "7px", width: "8px", height: "8px", borderTop: `2px solid ${ACCENT}`, borderLeft: `2px solid ${ACCENT}` }} />
          <div style={{ position: "absolute", top: "7px", right: "7px", width: "8px", height: "8px", borderTop: `2px solid ${ACCENT}`, borderRight: `2px solid ${ACCENT}` }} />
          <div style={{ position: "absolute", bottom: "7px", left: "7px", width: "8px", height: "8px", borderBottom: `2px solid ${ACCENT}`, borderLeft: `2px solid ${ACCENT}` }} />
          <div style={{ position: "absolute", bottom: "7px", right: "7px", width: "8px", height: "8px", borderBottom: `2px solid ${ACCENT}`, borderRight: `2px solid ${ACCENT}` }} />

          {/* Header bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ ...PIXEL_FONT, fontSize: "clamp(0.38rem, 1.1vw, 0.46rem)", letterSpacing: "0.28em", color: `${ACCENT}99` }}>
              ■ SING-ALONG CH.
            </span>
            <span style={{ ...PIXEL_FONT, fontSize: "clamp(0.32rem, 0.9vw, 0.4rem)", letterSpacing: "0.18em", color: `${ACCENT}44` }}>
              EXhOrizon
            </span>
          </div>

          {/* Screen */}
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingTop: "56.25%",
              background: "#030810",
              borderRadius: "6px",
              border: `2px solid ${ACCENT}33`,
              boxShadow: `inset 0 0 60px rgba(0,229,255,0.06), inset 0 0 2px ${ACCENT}22`,
              overflow: "hidden",
            }}
          >
            {/* Scanlines */}
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)", zIndex: 3, pointerEvents: "none" }} />
            {/* Vignette */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.55) 100%)", zIndex: 2, pointerEvents: "none" }} />

            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
              {selectedDay === null ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(6px, 1.5vw, 12px)", padding: "16px" }}>
                  <span style={{ ...PIXEL_FONT, fontSize: "clamp(0.9rem, 4vw, 1.7rem)", fontWeight: 800, color: ACCENT, letterSpacing: "0.2em", animation: "chorus-pulse 2.2s ease-in-out infinite" }}>
                    ▶&nbsp;START
                  </span>
                  <span style={{ ...PIXEL_FONT, fontSize: "clamp(0.42rem, 1.5vw, 0.62rem)", letterSpacing: "0.22em", color: `${ACCENT}cc` }}>
                    ARE YOU READY?
                  </span>
                  <span style={{ ...PIXEL_FONT, fontSize: "clamp(0.32rem, 0.9vw, 0.42rem)", letterSpacing: "0.14em", color: `${ACCENT}44`, marginTop: "6px", animation: "chorus-blink 1.4s step-end infinite" }}>
                    SELECT DAY ↓
                  </span>
                </div>
              ) : embedUrl ? (
                <iframe
                  key={selectedDay}
                  src={embedUrl}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={`EXhOrizon ${DAYS[selectedDay].label} Sing-Along`}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <span style={{ ...PIXEL_FONT, fontSize: "clamp(0.6rem, 2.5vw, 1rem)", fontWeight: 800, color: `${ACCENT}66`, letterSpacing: "0.2em" }}>
                    COMING SOON
                  </span>
                  <span style={{ ...PIXEL_FONT, fontSize: "clamp(0.32rem, 0.9vw, 0.42rem)", letterSpacing: "0.14em", color: `${ACCENT}33` }}>
                    NO SIGNAL
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: selectedDay !== null ? ACCENT : `${ACCENT}33`, boxShadow: selectedDay !== null ? `0 0 5px ${ACCENT}` : "none", transition: "background-color 0.3s, box-shadow 0.3s" }} />
              <span style={{ ...PIXEL_FONT, fontSize: "0.35rem", letterSpacing: "0.14em", color: `${ACCENT}44` }}>PWR</span>
            </div>
            {selectedDay !== null && (
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                style={{ background: "none", border: `1px solid ${ACCENT}44`, color: `${ACCENT}77`, cursor: "pointer", ...PIXEL_FONT, fontSize: "0.36rem", letterSpacing: "0.14em", padding: "3px 8px", borderRadius: "2px", transition: "border-color 0.1s, color 0.1s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT; (e.currentTarget as HTMLButtonElement).style.color = ACCENT; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = `${ACCENT}44`; (e.currentTarget as HTMLButtonElement).style.color = `${ACCENT}77`; }}
              >
                ◀ BACK
              </button>
            )}
            <div style={{ display: "flex", gap: "3px" }}>
              {DAYS.map((_, i) => (
                <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: selectedDay === i ? ACCENT : `${ACCENT}22`, boxShadow: selectedDay === i ? `0 0 4px ${ACCENT}` : "none", transition: "background-color 0.2s" }} />
              ))}
            </div>
          </div>
        </div>

        {/* ══ DAY Selector Buttons ══ */}
        <div style={{ display: "flex", gap: "clamp(6px, 2vw, 10px)", flexWrap: "wrap", justifyContent: "center" }}>
          {DAYS.map((day, i) => {
            const idx = i as DayIdx;
            const isActive = selectedDay === idx;
            const isPressed = pressed === idx;
            return (
              <button
                key={i}
                type="button"
                onPointerDown={() => setPressed(idx)}
                onPointerUp={() => { setPressed(null); setSelectedDay(idx); }}
                onPointerLeave={() => setPressed(null)}
                onPointerCancel={() => setPressed(null)}
                style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "stretch", cursor: "pointer", border: "none", background: "none", padding: 0, paddingBottom: isPressed ? "1px" : "4px", ...PIXEL_FONT }}
              >
                <span aria-hidden style={{ position: "absolute", bottom: 0, left: "2px", right: "2px", height: isPressed ? "1px" : "4px", backgroundColor: isActive ? "#00808f" : "#003340", borderRadius: "2px 2px 4px 4px", transition: "height 0.07s ease" }} />
                <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "clamp(4px, 1vw, 6px) clamp(10px, 3vw, 16px)", minWidth: "clamp(52px, 15vw, 68px)", backgroundColor: isActive ? ACCENT : "#081520", border: `2px solid ${isActive ? ACCENT : ACCENT + "44"}`, borderRadius: "4px", boxShadow: isActive ? `0 0 16px ${ACCENT}66, inset 0 2px 0 rgba(255,255,255,0.3), inset 2px 0 0 rgba(255,255,255,0.1)` : "inset 0 2px 0 rgba(255,255,255,0.04)", transform: isPressed ? "translateY(3px)" : "translateY(0)", transition: "transform 0.07s ease, background-color 0.15s, box-shadow 0.15s, border-color 0.15s", fontSize: "clamp(0.46rem, 1.4vw, 0.58rem)", fontWeight: 800, letterSpacing: "0.1em", color: isActive ? "#001a1f" : `${ACCENT}88`, whiteSpace: "nowrap" }}>
                  {day.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ══ 가사지 사진 + 언어 선택 ══ */}
        {selectedDay !== null && (
          <div style={{ width: "100%", maxWidth: "560px" }}>
            {/* 언어 버튼 */}
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "10px" }}>
              {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  style={{
                    ...PIXEL_FONT,
                    fontSize: "clamp(0.38rem, 1.1vw, 0.48rem)",
                    letterSpacing: "0.1em",
                    padding: "3px 10px",
                    borderRadius: "2px",
                    border: `1px solid ${lang === l ? ACCENT : ACCENT + "33"}`,
                    background: lang === l ? `${ACCENT}22` : "transparent",
                    color: lang === l ? ACCENT : `${ACCENT}55`,
                    cursor: "pointer",
                    transition: "border-color 0.15s, color 0.15s, background 0.15s",
                  }}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>

            {/* 사진 */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: 6, left: 6, width: 10, height: 10, borderTop: `2px solid ${ACCENT}`, borderLeft: `2px solid ${ACCENT}`, zIndex: 4 }} />
              <div style={{ position: "absolute", top: 6, right: 6, width: 10, height: 10, borderTop: `2px solid ${ACCENT}`, borderRight: `2px solid ${ACCENT}`, zIndex: 4 }} />
              <div style={{ position: "absolute", bottom: 6, left: 6, width: 10, height: 10, borderBottom: `2px solid ${ACCENT}`, borderLeft: `2px solid ${ACCENT}`, zIndex: 4 }} />
              <div style={{ position: "absolute", bottom: 6, right: 6, width: 10, height: 10, borderBottom: `2px solid ${ACCENT}`, borderRight: `2px solid ${ACCENT}`, zIndex: 4 }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`${selectedDay}-${lang}`}
                src={DAYS[selectedDay].imgs[lang]}
                alt={`${DAYS[selectedDay].label} 가사지 (${LANG_LABELS[lang]})`}
                style={{ display: "block", width: "100%", height: "auto", border: `2px solid ${ACCENT}55`, borderRadius: "4px" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)", borderRadius: "4px", zIndex: 3, pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: 10, right: 12, zIndex: 5, ...PIXEL_FONT, fontSize: "clamp(0.38rem, 1.1vw, 0.46rem)", fontWeight: 800, letterSpacing: "0.2em", color: ACCENT, textShadow: `0 0 8px ${ACCENT}` }}>
                {DAYS[selectedDay].label}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
