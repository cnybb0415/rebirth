"use client";

import { useState } from "react";
import Image from "next/image";

type Lang = "ko" | "en" | "cn" | "jp";

const LANG_LABELS: Record<Lang, string> = {
  ko: "한국어",
  en: "English",
  cn: "中文",
  jp: "日本語",
};

interface QRLangViewerProps {
  images: Record<Lang, string>;
  alt: string;
}

export function QRLangViewer({ images, alt }: QRLangViewerProps) {
  const [lang, setLang] = useState<Lang>("ko");

  return (
    <div>
      <div className="mb-4 flex justify-center gap-2">
        {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              lang === l
                ? "bg-foreground text-background"
                : "border border-foreground/20 text-foreground/50 hover:border-foreground/40 hover:text-foreground/80"
            }`}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-foreground/10">
        <Image
          src={images[lang]}
          alt={`${alt} (${LANG_LABELS[lang]})`}
          width={800}
          height={1200}
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  );
}
