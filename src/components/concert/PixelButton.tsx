"use client";

import { useState } from "react";

const PIXEL_FONT: React.CSSProperties = {
  fontFamily: "'Mulmaru', monospace",
  WebkitFontSmoothing: "none",
};

interface PixelButtonProps {
  label: string;
  /** 버튼 면(face) 색상 */
  accentColor: string;
  /** 버튼 아래 그림자(base) 색상 — accentColor보다 어둡게 */
  shadowColor: string;
  textColor?: string;
  /** 일반 링크 */
  href?: string;
  /** Toss 딥링크 특수 처리 */
  isToss?: boolean;
  /** 링크 대신 클릭 핸들러 */
  onClick?: () => void;
}

export function PixelButton({
  label,
  accentColor,
  shadowColor,
  textColor = "#ffffff",
  href,
  isToss = false,
  onClick,
}: PixelButtonProps) {
  const [pressed, setPressed] = useState(false);

   // 모바일에서 자동으로 줄어드는 값들 (작은 화면=최소값, 큰 화면=최대값)
  const FACE_PAD_Y = "clamp(4px, 1.2vw, 7px)";
  const FACE_PAD_X = "clamp(8px, 2.2vw, 14px)";
  const FACE_FONT  = "clamp(0.48rem, 1.6vw, 0.65rem)";
  const FACE_TRACK = "clamp(0.06em, 0.6vw, 0.12em)"; // letterSpacing
  const FACE_MIN_W = "clamp(52px, 16vw, 72px)";

  const BASE_H = pressed ? "2px" : "clamp(3px, 0.9vw, 5px)";
  const BASE_PAD_BOTTOM = "clamp(3px, 0.9vw, 5px)";

  const handleAction = () => {
    if (isToss && href) {
      try {
        window.location.href = href;
        setTimeout(() => {
          window.location.href = "supertoss://send?";
        }, 2000);
      } catch {
        window.location.href = "supertoss://send?";
      }
    } else if (href) {
      window.open(href, "_blank", "noreferrer");
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => {
        setPressed(false);
        handleAction();
      }}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "stretch",
        cursor: "pointer",
        userSelect: "none",
        border: "none",
        background: "none",
        padding: 0,
        /* 버튼 base 높이만큼 아래 여백 확보 */
        paddingBottom: BASE_PAD_BOTTOM,
        ...PIXEL_FONT,
      }}
    >
      {/* ── base (3D 받침대) ── */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: "2px",
          right: "2px",
          height: pressed ? "2px" : BASE_H,
          backgroundColor: shadowColor,
          borderRadius: "3px 3px 4px 4px",
          transition: "height 0.07s ease",
        }}
      />

      {/* ── 버튼 face ── */}
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `${FACE_PAD_Y} ${FACE_PAD_X}`,
          minWidth: FACE_MIN_W,
          backgroundColor: accentColor,
          border: "2px solid rgba(0,0,0,0.35)",
          borderRadius: "4px",
          /* 위쪽 하이라이트 + 왼쪽 하이라이트 (pixel art 3D) */
          boxShadow:
            "inset 0 2px 0 rgba(255,255,255,0.35), inset 2px 0 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2)",
          transform: pressed ? "translateY(3px)" : "translateY(0px)",
          transition: "transform 0.07s ease",
          fontSize: FACE_FONT,
          fontWeight: 800,
          letterSpacing: FACE_TRACK,
          color: textColor,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </button>
  );
}
