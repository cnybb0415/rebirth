"use client";

import {
  cheeringGuideSongs,
  type GuideAsset,
} from "@/data/guides";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

function EmptyState({ title, lines }: { title: string; lines: string[] }) {
  const t = useTranslations("concert");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-foreground/80">{t("noGuide")}</p>
        <div className="rounded-xl border border-foreground/10 bg-white p-3 text-xs text-foreground/80 shadow-sm">
          <div className="font-semibold">Upload method</div>
          <div className="mt-1 space-y-1">
            {lines.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Assets({
  title,
  idKey,
  assets,
  emptyLines,
}: {
  title: string;
  idKey: string;
  assets: GuideAsset[];
  emptyLines: string[];
}) {
  const t = useTranslations("concert");
  if (!assets.length) return <EmptyState title={title} lines={emptyLines} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assets.map((asset, idx) => {
          if (asset.type === "pdf") {
            return (
              <a
                key={`${idKey}-pdf-${idx}`}
                href={asset.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="secondary" className="w-full justify-between">
                  <span>{asset.label ?? t("openPdf")}</span>
                  <span className="text-xs text-foreground/70">{t("newTab")}</span>
                </Button>
              </a>
            );
          }

          return (
            <div
              key={`${idKey}-img-${idx}`}
              className="overflow-hidden rounded-2xl border border-foreground/10 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.src}
                alt={asset.alt ?? `${title} ${idx + 1}`}
                className="h-auto w-full"
                loading="lazy"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function CheeringGuide() {
  const t = useTranslations("concert");
  const songs = cheeringGuideSongs;
  const defaultSong = songs[0]?.id ?? "";

  if (!songs.length) {
    return (
      <EmptyState
        title={t("cheerTitle")}
        lines={[
              "1) 파일을 public/images/concert/cheering/<song-id>/guide/ 아래에 넣기",
              "2) 커버는 public/images/concert/cheering/<song-id>/album-art/ 아래에 넣기 (선택)",
          "2) src/data/guides.ts 의 cheeringGuideSongs에 곡을 추가",
              "예시: /images/concert/cheering/who-are-you/guide/who-are-you.jpg",
        ]}
      />
    );
  }

  return (
    <Tabs defaultValue={defaultSong}>
      <div className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <div className="mb-2 text-sm font-semibold text-foreground/80">{t("song")}</div>
          <TabsList
            aria-label={t("cheerTitle")}
            className="flex flex-col gap-1 rounded-2xl p-2"
          >
            {songs.map((song) => (
              <TabsTrigger key={song.id} value={song.id} variant="sidebar">
                {song.label} {t("cheerTitle")}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="min-w-0">
          {songs.map((song) => (
            <TabsContent key={song.id} value={song.id} className="mt-0">
              <Assets
                title={`${song.label} ${t("cheerTitle")}`}
                idKey={`cheering-${song.id}`}
                assets={song.assets}
                emptyLines={[
                  "1) 파일을 public/images/concert/cheering/<song-id>/guide/ 아래에 넣기",
                  `2) src/data/guides.ts 에서 ${song.label} assets에 경로 추가`,
                  "예시: /images/concert/cheering/who-are-you/guide/who-are-you.jpg",
                ]}
              />
            </TabsContent>
          ))}
        </div>
      </div>
    </Tabs>
  );
}
