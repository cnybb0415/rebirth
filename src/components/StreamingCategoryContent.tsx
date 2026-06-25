"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { StreamingLinksGrid } from "@/components/StreamingLinksGrid";
import { OneClickStreamingGrid } from "@/components/OneClickStreamingGrid";
import { type StreamingCategoryId } from "@/lib/streamingCategories";

function RecommendedChecklist({ title }: { title: string }) {
  const [listImages, setListImages] = useState<Array<{ name: string; src: string }>>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/streaming-list", { cache: "no-store" });
        const json = (await res.json()) as { items?: Array<{ name: string; src: string }> };
        const items = Array.isArray(json.items) ? json.items : [];
        if (!cancelled) setListImages(items);
      } catch {
        if (!cancelled) setListImages([]);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {listImages.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-white">
            {listImages.map((img) => (
              <div key={img.src} className="border-b border-foreground/10 last:border-b-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.name} className="h-auto w-full" loading="lazy" />
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function StreamingCategoryContent({ categoryId }: { categoryId: StreamingCategoryId }) {
  const t = useTranslations("streaming");

  if (categoryId === "recommended") {
    return <RecommendedChecklist title={t("cat.recommended")} />;
  }

  if (categoryId === "oneclick") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("cat.oneclick")}</CardTitle>
        </CardHeader>
        <CardContent>
          <OneClickStreamingGrid
            links={siteConfig.oneClickStreamingLinks}
            columnsClassName="grid-cols-2 gap-2 sm:grid-cols-3"
            buttonVariant="outline"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cat.links")}</CardTitle>
      </CardHeader>
      <CardContent>
        <StreamingLinksGrid
          links={siteConfig.streamingLinks}
          youtubeUrl={siteConfig.youtube.url}
          columnsClassName="grid-cols-2 gap-2 sm:grid-cols-3"
          buttonVariant="secondary"
        />
      </CardContent>
    </Card>
  );
}
