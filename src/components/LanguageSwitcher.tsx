"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";

const LOCALES = [
  { code: "ko", label: "한국어", short: "KR" },
  { code: "en", label: "English", short: "EN" },
  { code: "zh", label: "中文", short: "ZH" },
  { code: "ja", label: "日本語", short: "JP" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const switchLocale = (code: string) => {
    router.replace(pathname, { locale: code });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-foreground/15 bg-foreground/5 px-3 py-1.5 text-xs font-semibold tracking-wider text-foreground/70 transition hover:border-foreground/30 hover:text-foreground"
        aria-label="언어 선택"
      >
        <span className="text-[10px] font-bold">{current.short}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-2xl border border-foreground/10 bg-white shadow-xl">
          {LOCALES.map((l) => {
            const active = l.code === locale;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => switchLocale(l.code)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-foreground text-background"
                    : "text-foreground/80 hover:bg-foreground/5"
                }`}
              >
                <span className="font-medium">{l.label}</span>
                <span className={`text-[10px] font-bold tracking-widest ${active ? "text-background/60" : "text-foreground/30"}`}>
                  {l.short}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
