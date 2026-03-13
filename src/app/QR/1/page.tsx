import type { Metadata } from "next";
import { QRLangViewer } from "@/components/QRLangViewer";

export const metadata: Metadata = {
  title: "오프닝 떼창 - 월광 | EXO RE:BIRTH",
};

export default function QR1Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-foreground/10 bg-white p-6 shadow-sm">
          <div className="mb-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40">오프닝 떼창</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">월광</h1>
          </div>
          <QRLangViewer
            alt="월광 떼창 안내"
            images={{
              ko: "/images/QR/떼창/월광/moonlight_ko.png",
              en: "/images/QR/떼창/월광/moonlight_en.png",
              cn: "/images/QR/떼창/월광/moonlight_cn.png",
              jp: "/images/QR/떼창/월광/moonlight_jp.png",
            }}
          />
        </div>
      </main>
    </div>
  );
}
