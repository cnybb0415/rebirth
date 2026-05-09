"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function TossActionButton({ href, label }: { href: string; label: string }) {
  return (
    <button
      className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/90"
      onClick={() => {
        try {
          window.location.href = href;
          setTimeout(() => {
            window.location.href = "supertoss://send?";
          }, 2000);
        } catch {
          window.location.href = "supertoss://send?";
        }
      }}
    >
      {label}
    </button>
  );
}

export function AnnouncementDetailActions() {
  const t = useTranslations("concert");
  const [currentUrl, setCurrentUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopy = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op
    }
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* 뒤로가기 */}
        <button
          type="button"
          onClick={() => window.history.back()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.75)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 0",
            transition: "color 0.1s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#ffffff")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color =
              "rgba(255,255,255,0.75)")
          }
        >
          <span style={{ fontSize: "1.2rem", lineHeight: 1 }} aria-hidden>
            ‹
          </span>
          {t("back")}
</button>

        {/* URL 복사 (공유) */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={t("copyUrl")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            color: copied ? "#ffd700" : "rgba(255,215,0,0.6)",
            background: "none",
            border: "1px solid rgba(255,215,0,0.25)",
            cursor: "pointer",
            transition: "color 0.1s, border-color 0.1s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#ffd700";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(255,215,0,0.6)";
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(255,215,0,0.6)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(255,215,0,0.25)";
            }
          }}
        >
          <svg
            viewBox="0 0 24 24"
            style={{ width: "16px", height: "16px" }}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.6 10.8l6.8-3.6M15.4 16.8l-6.8-3.6" />
          </svg>
        </button>
      </div>

      {copied && (
        <div
          style={{
            marginTop: "6px",
            textAlign: "right",
            fontSize: "0.55rem",
            letterSpacing: "0.15em",
            color: "#ffd700",
            fontWeight: 700,
          }}
        >
          {t("linkCopied")}
        </div>
      )}
    </div>
  );
}
