"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const LANGS = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
] as const;

type LangCode = (typeof LANGS)[number]["code"];

const LYRICS_DIR = "/images/concert/encore/sing-along/" + encodeURIComponent("가사지");

export function SingAlongClient({
  songId,
  title,
  initialLocale,
}: {
  songId: string;
  title: string;
  initialLocale: string;
}) {
  const defaultLang = (LANGS.some((l) => l.code === initialLocale) ? initialLocale : "ko") as LangCode;
  const [lang, setLang] = useState<LangCode>(defaultLang);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40">Sing-Along</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      </div>

      <Tabs value={lang} onValueChange={(v) => setLang(v as LangCode)}>
        <TabsList aria-label="언어 선택" className="justify-center">
          {LANGS.map((l) => (
            <TabsTrigger key={l.code} value={l.code} variant="pill">
              {l.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {LANGS.map((l) => (
          <TabsContent key={l.code} value={l.code}>
            <Card>
              <CardContent className="overflow-hidden rounded-2xl p-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${LYRICS_DIR}/${songId}_${l.code}.png`}
                  alt={`${title} 가사지 (${l.label})`}
                  className="block h-auto w-full"
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}
