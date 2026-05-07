"use client";

import { useState } from "react";
import { TossActionButton } from "@/components/AnnouncementDetailActions";
import { cn } from "@/lib/utils";

const LANGS = [
  { label: "한국어", src: "/images/support/fund/모금공지.png", alt: "모금공지 한국어" },
  { label: "English", src: "/images/support/fund/모금공지_en.png", alt: "Fundraising Notice English" },
  { label: "中文", src: "/images/support/fund/모금공지_cn.png", alt: "募款公告 中文" },
  { label: "日本語", src: "/images/support/fund/모금공지_jp.png", alt: "募金のお知らせ 日本語" },
] as const;

export default function SupportFundPage() {
  const [activeLang, setActiveLang] = useState(0);

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-bold">모금공지</h1>

        <div className="mt-6">
          {/* 언어 탭 */}
          <div className="mb-3 flex gap-2">
            {LANGS.map((lang, i) => (
              <button
                key={lang.label}
                type="button"
                onClick={() => setActiveLang(i)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                  activeLang === i
                    ? "border-transparent bg-foreground text-background"
                    : "border-foreground/15 bg-white text-foreground/70 hover:bg-foreground/5"
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* 이미지 */}
          <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LANGS[activeLang].src}
              alt={LANGS[activeLang].alt}
              className="h-auto w-full"
              loading="lazy"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <TossActionButton href="supertoss://send?bank=토스뱅크&accountNo=100159180057" label="TOSS" />
            <a
              href="https://paypal.me/EXOREBIRTH"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/90"
            >
              PAYPAL
            </a>
          </div>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSd1nF68HSKuxfRThMP0uBNx3ZVwUtlIfdq4lByRR2SVuTnTHg/viewform"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-foreground/15 bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:border-foreground/35 hover:shadow-md"
          >
            입금 폼 작성
          </a>
        </div>
      </main>
    </div>
  );
}
