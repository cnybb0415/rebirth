"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { BarChart3, Disc3, Link2, ListMusic, MousePointerClick } from "lucide-react";
import { MenuTiles } from "@/components/MenuTiles";
import { siteConfig } from "@/config/site";
import { streamingCategories } from "@/lib/streamingCategories";

const STREAMING_EN: Record<string, { en: string; Icon: typeof Link2 }> = {
  recommended: { en: "PLAYLIST", Icon: ListMusic },
  oneclick: { en: "ONE CLICK", Icon: MousePointerClick },
  links: { en: "LINKS", Icon: Link2 },
};

export default function StreamingPage() {
  const t = useTranslations("streaming");
  const tn = useTranslations("nav");
  const tc = useTranslations("common");
  const [openAlbumModal, setOpenAlbumModal] = useState(false);

  const streamingCatLabels: Record<string, string> = {
    recommended: t("cat.recommended"),
    oneclick: t("cat.oneclick"),
    links: t("cat.links"),
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-bold">{t("title")}</h1>

        <MenuTiles
          items={[
            { id: "charts", label: tn("charts"), en: "CHART", Icon: BarChart3, href: "/charts" },
            ...streamingCategories.map((c) => ({
              id: c.id,
              label: streamingCatLabels[c.id] ?? c.label,
              en: STREAMING_EN[c.id]?.en ?? c.id.toUpperCase(),
              Icon: STREAMING_EN[c.id]?.Icon ?? Link2,
              href: `/streaming/${c.id}`,
            })),
            { id: "album", label: tc("albumBuy"), en: "ALBUM", Icon: Disc3, onClick: () => setOpenAlbumModal(true) },
          ]}
        />
      </main>

      {openAlbumModal ? (
        <div className="fixed inset-0 z-40">
          <button
            aria-label={tc("close")}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenAlbumModal(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={tc("albumBuy")}
            className="relative mx-auto mt-24 w-[min(520px,calc(100%-2rem))] rounded-2xl border border-foreground/10 bg-background p-4 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-base font-semibold">{tc("albumBuy")}</div>
              <Button size="sm" variant="ghost" onClick={() => setOpenAlbumModal(false)}>
                {tc("close")}
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {siteConfig.albumPurchaseLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="secondary" className="h-11 w-full">
                    {link.label}
                  </Button>
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
