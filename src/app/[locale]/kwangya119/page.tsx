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
    <div className="group relative overflow-hidden rounded-2xl bg-white">
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src) => (
          <div key={src} className="min-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={t("imgAlt")}
              className="h-auto w-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={goPrev}
        aria-label={tHome("prevImage")}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <span className="block text-sm">‹</span>
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label={tHome("nextImage")}
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
            aria-label={tHome("viewImage", { n: i + 1 })}
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

export default function Kwangya119Page() {
  const t = useTranslations("kwangya119");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-sm text-foreground/70">{t("description")}</p>
        </div>
      </div>

      <div className="mt-6">
        <a
          href="https://kwangya119.smtown.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-foreground/15 bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:border-foreground/35 hover:shadow-md"
        >
          <img src="/images/icon/siren.png" alt="" className="h-4 w-4" />
          <span>{t("reportBtn")}</span>
        </a>
      </div>

      <Tabs defaultValue="report">
        <div className="mt-8 mb-6">
          <TabsList aria-label="kwangya119" className="justify-center">
            <TabsTrigger value="pdf" variant="pill">{t("pdfTab")}</TabsTrigger>
            <TabsTrigger value="report" variant="pill">{t("reportTab")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pdf" className="mt-0">
          <section className="rounded-2xl border border-foreground/10 bg-white p-4 shadow-sm">
            <Tabs defaultValue="ios">
              <div className="mb-4">
                <TabsList aria-label="pdf-platform" className="justify-center">
                  <TabsTrigger value="ios" variant="pill">{t("iosTab")}</TabsTrigger>
                  <TabsTrigger value="android" variant="pill">{t("androidTab")}</TabsTrigger>
                  <TabsTrigger value="pc" variant="pill">{t("pcTab")}</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="ios" className="mt-0">
                <ImageCarousel images={kwangyaIosImages} />
                <div className="mt-6 rounded-2xl border border-foreground/10 bg-white p-6 text-sm text-foreground/70">
                  <ul className="list-decimal space-y-1 pl-5">
                    <li>{t("ios.step1")}</li>
                    <li>{t("ios.step2")}</li>
                    <li>{t("ios.step3")}</li>
                    <li>{t("ios.step4")}</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="android" className="mt-0">
                <ImageCarousel images={kwangyaAndroidImages} />
                <div className="mt-6 rounded-2xl border border-foreground/10 bg-white p-6 text-sm text-foreground/70">
                  <ul className="list-decimal space-y-1 pl-5">
                    <li>{t("android.step1")}</li>
                    <li>{t("android.step2")}</li>
                    <li>{t("android.step3")}</li>
                    <li>{t("android.step4")}</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="pc" className="mt-0">
                <ImageCarousel images={kwangyaPcImages} />
                <div className="mt-6 rounded-2xl border border-foreground/10 bg-white p-6 text-sm text-foreground/70">
                  <ul className="list-decimal space-y-1 pl-5">
                    <li>{t("pc.step1")}</li>
                    <li>{t("pc.step2")}</li>
                    <li>{t("pc.step3")}</li>
                    <li>{t("pc.step4")}</li>
                    <li>{t("pc.step5")}</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </TabsContent>

        <TabsContent value="report" className="mt-0">
          <section className="rounded-2xl border border-foreground/10 bg-white p-4 shadow-sm">
            <ImageCarousel images={kwangyaReportImages} />
          </section>

          <section className="mt-6 rounded-2xl border border-foreground/10 bg-white p-6 shadow-sm">
            <div className="text-base font-semibold">{t("reportGuideTitle")}</div>
            <div className="mt-2 text-sm text-foreground/70">
              <ul className="list-decimal space-y-1 pl-5">
                <li>{t("report.step1")}</li>
                <li>{t("report.step2")}</li>
                <li>{t("report.step3")}</li>
                <li>{t("report.step4")}</li>
              </ul>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </main>
  );
}
