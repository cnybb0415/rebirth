"use client";

import { useEffect, useState } from "react";
import type { LabLang } from "@/data/lab";

const COPY = {
  ko: { copy: "복사", copied: "복사됨", aria: (t: string) => `${t} 복사` },
  en: { copy: "Copy", copied: "Copied", aria: (t: string) => `Copy ${t}` },
};

export function CopyCode({ text, lang, showText = true }: { text: string; lang: LabLang; showText?: boolean }) {
  const c = COPY[lang];
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <span className="inline-flex max-w-full items-center gap-1 align-middle">
      {showText && (
        <code className="break-all rounded-md bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[0.85em]">{text}</code>
      )}
      <button
        type="button"
        onClick={() => void navigator.clipboard.writeText(text).then(() => setCopied(true))}
        className="shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
        aria-label={c.aria(text)}
      >
        {copied ? c.copied : c.copy}
      </button>
    </span>
  );
}
