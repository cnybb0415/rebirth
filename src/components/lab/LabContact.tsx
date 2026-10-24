import type { LabLang } from "@/data/lab";
import { CopyCode } from "./CopyCode";

const SPIN_URL = "https://spin-spin.com/exo_dev0408";
const EMAIL = "exo.dev0408@gmail.com";

const COPY = {
  ko: { title: "EXO.zip 문의", subject: "[EXO.zip] 문의" },
  en: { title: "Questions about EXO.zip", subject: "[EXO.zip] Inquiry" },
};

// 페이지 맨 아래 작게 붙는 문의 줄
export function LabContact({ lang }: { lang: LabLang }) {
  const c = COPY[lang];
  return (
    <footer className="mt-12 border-t border-foreground/10 pt-4 text-xs text-foreground/50">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-semibold text-foreground/60">{c.title}</span>
        <a
          href={SPIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          spin-spin ↗
        </a>
        <span aria-hidden>·</span>
        <a
          href={`mailto:${EMAIL}?subject=${encodeURIComponent(c.subject)}`}
          className="underline underline-offset-2 hover:text-foreground"
        >
          {EMAIL}
        </a>
        <CopyCode text={EMAIL} lang={lang} showText={false} />
      </p>
    </footer>
  );
}
