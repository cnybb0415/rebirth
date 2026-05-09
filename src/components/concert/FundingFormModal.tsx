"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PixelButton } from "./PixelButton";

const ACCENT = "#ffd700";
const FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe5yBba1sPzJQsy2rBqOP5PU6BZDfw7XmmR-H3nrS7yhhopBw/viewform?embedded=true";

const PIXEL_FONT: React.CSSProperties = {
  fontFamily: "'PFStarDust', monospace",
  WebkitFontSmoothing: "none",
};

export function FundingFormModal() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("support");
  const tc = useTranslations("common");

  return (
    <>
      <PixelButton
        label={t("depositForm")}
        accentColor="#4CFF7A"
        shadowColor="#1E8A3B"
        textColor="#031A0B"
        onClick={() => setOpen(true)}
      />

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("depositForm")}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.88)",
            paddingTop: "max(0px, env(safe-area-inset-top))",
            paddingRight: "max(12px, env(safe-area-inset-right))",
            paddingBottom: "max(16px, env(safe-area-inset-bottom))",
            paddingLeft: "max(12px, env(safe-area-inset-left))",
            boxSizing: "border-box",
          } as React.CSSProperties}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            style={{
              width: "min(920px, calc(100vw - 24px))",
              maxHeight: "min(900px, 90vh)",
              display: "flex",
              flexDirection: "column",
              background:
                "linear-gradient(170deg, rgba(10,12,28,0.99) 0%, rgba(5,7,18,1) 100%)",
              border: `2.5px solid ${ACCENT}`,
              boxShadow: `0 0 40px ${ACCENT}33, 0 20px 60px rgba(0,0,0,0.8)`,
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {/* ── 헤더 ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px 9px",
                borderBottom: `1px solid ${ACCENT}44`,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  ...PIXEL_FONT,
                  fontSize: "0.55rem",
                  fontWeight: 800,
                  letterSpacing: "0.25em",
                  color: ACCENT,
                }}
              >
                💰 {t("depositForm")}
              </span>

              <div style={{ display: "flex", gap: "3px" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "4px",
                      height: "4px",
                      backgroundColor: i % 2 === 0 ? ACCENT : "transparent",
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                aria-label={tc("close")}
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "1px solid rgba(255,215,0,0.3)",
                  color: "rgba(255,215,0,0.7)",
                  cursor: "pointer",
                  ...PIXEL_FONT,
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  padding: "4px 8px",
                  lineHeight: 1,
                  transition: "border-color 0.1s, color 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT;
                  (e.currentTarget as HTMLButtonElement).style.color = ACCENT;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(255,215,0,0.3)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "rgba(255,215,0,0.7)";
                }}
              >
                ✕ {tc("close")}
              </button>
            </div>

            {/* ── Google Form iframe ── */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                position: "relative",
                minHeight: "400px",
              }}
            >
              <iframe
                src={FORM_EMBED_URL}
                style={{
                  width: "100%",
                  height: "400px",
                  border: "none",
                  display: "block",
                }}
                title={t("depositForm")}
                loading="lazy"
              />
            </div>

            {/* ── 하단 바 ── */}
            <div
              style={{
                flexShrink: 0,
                padding: "8px 14px",
                borderTop: `1px solid ${ACCENT}22`,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <span
                style={{
                  ...PIXEL_FONT,
                  fontSize: "0.45rem",
                  letterSpacing: "0.2em",
                  color: "rgba(255,215,0,0.35)",
                }}
              >
                ★ · · · ★
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
