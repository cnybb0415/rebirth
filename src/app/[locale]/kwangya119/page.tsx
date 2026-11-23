"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const kwangyaIosImages = [
  "/images/119/ios/01.모바일.jpg",
  "/images/119/ios/02.모바일.jpg",
  "/images/119/ios/03.모바일.jpg",
  "/images/119/ios/04.모바일.jpg",
  "/images/119/ios/05.모바일.jpg",
];

const kwangyaAndroidImages = [
  "/images/119/android/01.모바일.jpg",
  "/images/119/android/02.모바일.jpg",
  "/images/119/android/03.모바일.jpg",
];

const kwangyaPcImages = [
  "/images/119/PC/01.PC.jpg",
  "/images/119/PC/02.PC.jpg",
  "/images/119/PC/03.PC.jpg",
  "/images/119/PC/04.PC.jpg",
  "/images/119/PC/05.PC.jpg",
  "/images/119/PC/06.PC.jpg",
];

const kwangyaReportImages = [
  "/images/119/KWANGYA/01.광야.jpg",
  "/images/119/KWANGYA/02.광야.jpg",
  "/images/119/KWANGYA/03.광야.jpg",
  "/images/119/KWANGYA/04.광야.jpg",
];

function ImageCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = React.useState(0);
  const touchX = React.useRef<number | null>(null);
  const total = images.length;

  React.useEffect(() => {
    setIndex(0);
  }, [images]);

  const go = React.useCallback(
    (d: number) => {
      if (!total) return;
      setIndex((prev) => Math.min(total - 1, Math.max(0, prev + d)));
    },
    [total]
  );

  const t = useTranslations("kwangya119");
  const tHome = useTranslations("home");
  if (!images.length) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-foreground/10 bg-white text-sm text-foreground/60">
        {t("preparing")}
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-2xl bg-black/20"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src) => (
            <div key={src} className="min-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={t("imgAlt")} className="h-auto w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      {total > 1 ? (
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label={tHome("prevImage")}
            className="grid h-9 w-9 place-items-center rounded-full border border-foreground/15 text-foreground/80 transition hover:bg-foreground/10 disabled:opacity-30"
          >
            ‹
          </button>
          <div className="flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={tHome("viewImage", { n: i + 1 })}
                className={"h-1.5 rounded-full transition-all " + (i === index ? "w-5 bg-foreground" : "w-1.5 bg-foreground/25")}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={index === total - 1}
            aria-label={tHome("nextImage")}
            className="grid h-9 w-9 place-items-center rounded-full border border-foreground/15 text-foreground/80 transition hover:bg-foreground/10 disabled:opacity-30"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="mt-5 space-y-3">
      {items.map((text, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/80">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground/10 text-xs font-bold tabular-nums text-foreground">
            {i + 1}
          </span>
          <span className="pt-0.5">{text}</span>
        </li>
      ))}
    </ol>
  );
}

export default function Kwangya119Page() {
  const t = useTranslations("kwangya119");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-sm text-foreground/60">{t("description")}</p>

      <a
        href="https://kwangya119.smtown.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-foreground text-sm font-semibold text-background transition hover:opacity-90"
      >
        <img src="/images/icon/siren.png" alt="" className="h-4 w-4" />
        <span>{t("reportBtn")}</span>
        <span aria-hidden>↗</span>
      </a>

      <Tabs defaultValue="report">
        <div className="mt-8 mb-5">
          <TabsList aria-label="kwangya119">
            <TabsTrigger value="report" variant="pill">{t("reportGuideTitle")}</TabsTrigger>
            <TabsTrigger value="pdf" variant="pill">{t("pdfTab")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="report" className="mt-0">
          <section className="rounded-2xl border border-foreground/10 bg-white p-4 sm:p-5">
            <ImageCarousel images={kwangyaReportImages} />
            <Steps items={[t("report.step1"), t("report.step2"), t("report.step3"), t("report.step4")]} />
          </section>
        </TabsContent>

        <TabsContent value="pdf" className="mt-0">
          <section className="rounded-2xl border border-foreground/10 bg-white p-4 sm:p-5">
            <Tabs defaultValue="ios">
              <div className="mb-4">
                <TabsList aria-label="pdf-platform">
                  <TabsTrigger value="ios" variant="pill">{t("iosTab")}</TabsTrigger>
                  <TabsTrigger value="android" variant="pill">{t("androidTab")}</TabsTrigger>
                  <TabsTrigger value="pc" variant="pill">{t("pcTab")}</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="ios" className="mt-0">
                <ImageCarousel images={kwangyaIosImages} />
                <Steps items={[t("ios.step1"), t("ios.step2"), t("ios.step3"), t("ios.step4")]} />
              </TabsContent>
              <TabsContent value="android" className="mt-0">
                <ImageCarousel images={kwangyaAndroidImages} />
                <Steps items={[t("android.step1"), t("android.step2"), t("android.step3"), t("android.step4")]} />
              </TabsContent>
              <TabsContent value="pc" className="mt-0">
                <ImageCarousel images={kwangyaPcImages} />
                <Steps items={[t("pc.step1"), t("pc.step2"), t("pc.step3"), t("pc.step4"), t("pc.step5")]} />
              </TabsContent>
            </Tabs>
          </section>
        </TabsContent>
      </Tabs>
    </main>
  );
}
