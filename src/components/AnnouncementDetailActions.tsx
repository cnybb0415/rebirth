"use client";

import { useEffect, useState } from "react";

export function AnnouncementDetailActions() {
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
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          <span className="text-xl" aria-hidden>
            ‹
          </span>
          뒤로가기
        </button>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="공지사항 URL 복사"
          className="inline-flex h-10 w-10 items-center justify-center text-foreground/70 hover:bg-foreground/5"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
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

      {copied ? (
        <div className="mt-2 text-right text-xs text-foreground/60">링크 복사됨</div>
      ) : null}
    </div>
  );
}
