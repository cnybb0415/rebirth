"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { openSms } from "@/lib/sms";

type ScheduleItem = { name: string; src: string };

const SMS_BODY = "엑소의 Crown 신청합니다!";

const STATIONS = [
  { name: "SBS 파워FM", to: "#1077" },
  { name: "SBS 러브FM", to: "#1035" },
  { name: "KBS COOL FM", to: "#8910" },
  { name: "MBC FM4U", to: "#8000" },
  { name: "MBC 표준FM", to: "#8001" },
] as const;

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = React.useState(0);
  const total = images.length;

  React.useEffect(() => {
    setIndex(0);
  }, [images]);

  const goPrev = React.useCallback(() => {
    if (!total) return;
    setIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goNext = React.useCallback(() => {
    if (!total) return;
    setIndex((prev) => (prev + 1) % total);
  }, [total]);

  if (!images.length) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-foreground/10 bg-white text-sm text-foreground/60">
        준비중입니다.
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white">
      <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src) => (
          <div key={src} className="min-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="h-auto w-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={goPrev}
        aria-label="이전 이미지"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <span className="block text-sm">‹</span>
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="다음 이미지"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <span className="block text-sm">›</span>
      </button>

      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={`dot-${i}`}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`이미지 ${i + 1} 보기`}
            className={
              "h-2 w-2 rounded-full border border-white/40 transition" +
              (i === index ? " bg-white" : " bg-transparent")
            }
          />
        ))}
      </div>
    </div>
  );
}

export default function RadioPage() {
  const fileNames = [
    "01.라디오 신청 가이드.png",
    "02.KBS.png",
    "03.MBC.png",
    "04.SBS.png",
  ].sort((a, b) => a.localeCompare(b, "ko", { numeric: true }));
  const items: ScheduleItem[] = fileNames.map((name) => ({
    name,
    src: `/images/radio/schedule/${encodeURIComponent(name)}`,
  }));
  const imageSources = items.map((item) => item.src);

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-6xl px-3 py-10 sm:px-6 sm:py-14">
        <h1 className="text-xl font-semibold">라디오 신청하기</h1>

        <Card className="mt-6 rounded-2xl">
          <CardContent className="p-4">
            <div className="text-sm font-semibold">원클릭 문자신청</div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {STATIONS.map((s) => (
                <Button
                  key={s.to}
                  type="button"
                  variant="secondary"
                  className="h-14 w-full justify-start rounded-2xl border border-foreground/15 bg-white px-4 text-left shadow-sm hover:bg-foreground/5"
                  onClick={() => openSms({ to: s.to, body: SMS_BODY })}
                >
                  {s.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 rounded-2xl">
          <CardContent className="p-4">
            <div className="text-sm font-semibold">라디오 스케줄</div>
            <div className="mt-3">
              <ImageCarousel images={imageSources} alt="라디오 신청 가이드" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
