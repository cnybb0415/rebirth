"use client";

import * as React from "react";

import {
  streamingGuideServices,
  type GuideAsset,
  type StreamingGuidePart,
  type StreamingGuideService,
} from "@/data/guides";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type GuideCategoryId } from "@/lib/guideCategories";
import { PrevoteCategoryContent } from "@/components/PrevoteCategoryContent";
import { prevoteCategories } from "@/lib/prevoteCategories";

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function expandExtensionCandidates(url: string) {
  const m = url.match(/^(.*)\.(png|jpg|jpeg|webp)$/i);
  if (!m) return [url];
  const base = m[1];
  const original = m[2].toLowerCase();
  const order = ["png", "jpg", "jpeg", "webp"].filter((ext) => ext !== original);
  return [`${base}.${original}`, ...order.map((ext) => `${base}.${ext}`)];
}

function GuideImage({
  src,
  fallbackSrcs,
  alt,
  missingLines,
}: {
  src: string;
  fallbackSrcs?: string[];
  alt: string;
  missingLines: string[];
}) {
  const candidates = React.useMemo(() => {
    const raw = [src, ...(fallbackSrcs ?? [])];
    return uniqueStrings(raw.flatMap(expandExtensionCandidates));
  }, [src, fallbackSrcs]);

  const [index, setIndex] = React.useState(0);
  const current = candidates[index];

  if (!current) {
    return (
      <div className="rounded-2xl border border-foreground/10 bg-white p-4 text-sm text-foreground/80">
        <div className="font-semibold">가이드 이미지를 찾을 수 없어요.</div>
        <div className="mt-2 space-y-1 text-xs">
          {missingLines.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={current}
      alt={alt}
      className="h-auto w-full"
      loading="lazy"
      onError={() => setIndex((prev) => prev + 1)}
    />
  );
}

function EmptyState({ title, lines }: { title: string; lines: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-foreground/80">아직 업로드된 가이드가 없어요.</p>
        <div className="rounded-xl border border-foreground/10 bg-white p-3 text-xs text-foreground/80 shadow-sm">
          <div className="font-semibold">업로드 방법</div>
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
                  <span>{asset.label ?? "PDF 열기"}</span>
                  <span className="text-xs text-foreground/70">새 탭</span>
                </Button>
              </a>
            );
          }

          return (
            <div
              key={`${idKey}-img-${idx}`}
              className="overflow-hidden rounded-2xl border border-foreground/10 bg-white"
            >
              <GuideImage
                src={asset.src}
                fallbackSrcs={asset.fallbackSrcs}
                alt={asset.alt ?? `${title} 이미지 ${idx + 1}`}
                missingLines={emptyLines}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

const findPart = (service: StreamingGuideService, partId: StreamingGuidePart["id"]) =>
  service.parts.find((part) => part.id === partId);

const buildEmptyLines = (serviceId: string, serviceLabel: string, partId: StreamingGuidePart["id"], partLabel: string) => [
  `1) 파일을 public/images/guides/${serviceId}/${partId === "signup" ? "idcreate" : partId}/ 아래에 넣기`,
  `2) src/data/guides.ts 에서 ${serviceLabel} > ${partLabel} assets에 경로 추가`,
  `파일명 규칙: ${serviceId}_${partId === "signup" ? "idcreate" : partId}.png (또는 .jpg)`,
];

const buildMvEmptyLines = (serviceId: string, serviceLabel: string) => [
  `1) 파일을 public/images/guides/${serviceId}/mv/ 아래에 넣기`,
  `2) src/data/guides.ts 에서 ${serviceLabel} > 뮤직비디오 다운로드 assets에 경로 추가`,
  `파일명 규칙: ${serviceId}_mv.png (또는 .jpg)`,
];

const buildMvServiceEmptyLines = (partId: "pcver" | "mobilever", partLabel: string) => [
  `1) 파일을 public/images/guides/뮤직비디오/${partId === "pcver" ? "PC" : "모바일"}/ 아래에 넣기`,
  `2) src/data/guides.ts 에서 뮤직비디오 > ${partLabel} assets에 경로 추가`,
];

export function GuideCategoryContent({ categoryId }: { categoryId: GuideCategoryId }) {
  const services = streamingGuideServices;
  const normalServices = services.filter((service) => service.id !== "mv");

  if (categoryId === "streaming") {
    const streamingItems = normalServices
      .map((service) => ({ service, part: findPart(service, "streaming") }))
      .filter((item): item is { service: StreamingGuideService; part: StreamingGuidePart } => Boolean(item.part));

    const defaultTab = streamingItems[0]?.service.id ?? "";

    return streamingItems.length ? (
      <Tabs defaultValue={defaultTab}>
        <div className="border-b border-foreground/10 pb-2">
          <TabsList
            aria-label="스트리밍 사이트"
            className="w-full flex-nowrap justify-start gap-6 overflow-x-auto rounded-none border-0 bg-transparent p-0 shadow-none"
          >
            {streamingItems.map(({ service }) => (
              <TabsTrigger key={service.id} value={service.id} variant="underline">
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span>{service.label}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {streamingItems.map(({ service, part }) => (
          <TabsContent key={service.id} value={service.id}>
            <Assets
              title={`${service.label} · ${part.label}`}
              idKey={`guide-${service.id}-${part.id}`}
              assets={part.assets}
              emptyLines={buildEmptyLines(service.id, service.label, part.id, part.label)}
            />
          </TabsContent>
        ))}
      </Tabs>
    ) : (
      <EmptyState title="가이드" lines={["아직 등록된 가이드가 없어요."]} />
    );
  }

  if (categoryId === "prevote") {
    const defaultTab = prevoteCategories[0]?.id ?? "";
    return (
      <Tabs defaultValue={defaultTab}>
        <div className="border-b border-foreground/10 pb-2">
          <TabsList
            aria-label="사전투표 가이드"
            className="w-full flex-nowrap justify-start gap-6 overflow-x-auto rounded-none border-0 bg-transparent p-0 shadow-none"
          >
            {prevoteCategories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} variant="underline">
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span>{cat.label}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {prevoteCategories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id}>
            <PrevoteCategoryContent categoryId={cat.id} />
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  if (categoryId === "mv") {
    const mvStreamingService = services.find((service) => service.id === "mv");
    const mvStreamingParts = mvStreamingService?.parts ?? [];

    const mvDownloadItems = normalServices
      .map((service) => ({ service, part: findPart(service, "mv") }))
      .filter((item): item is { service: StreamingGuideService; part: StreamingGuidePart } => Boolean(item.part));

    return (
      <Tabs defaultValue="streaming">
        <div className="border-b border-foreground/10 pb-2">
          <TabsList
            aria-label="뮤직비디오 항목"
            className="w-full flex-nowrap justify-start gap-6 overflow-x-auto rounded-none border-0 bg-transparent p-0 shadow-none"
          >
            <TabsTrigger value="streaming" variant="underline">
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <span>스트리밍</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="download" variant="underline">
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <span>다운로드</span>
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="streaming">
          <div className="mt-4 space-y-4">
            {mvStreamingParts.length ? (
              <Tabs defaultValue={mvStreamingParts[0]?.id ?? ""}>
                <div className="border-b border-foreground/10 pb-2">
                  <TabsList
                    aria-label="뮤직비디오 스트리밍"
                    className="w-full flex-nowrap justify-start gap-6 overflow-x-auto rounded-none border-0 bg-transparent p-0 shadow-none"
                  >
                    {mvStreamingParts.map((part) => (
                      <TabsTrigger key={part.id} value={part.id} variant="underline">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <span>{part.label}</span>
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                {mvStreamingParts.map((part) => (
                  <TabsContent key={part.id} value={part.id}>
                    <Assets
                      title={`뮤직비디오 스트리밍 · ${part.label}`}
                      idKey={`guide-mv-streaming-${part.id}`}
                      assets={part.assets}
                      emptyLines={buildMvServiceEmptyLines(part.id === "pcver" ? "pcver" : "mobilever", part.label)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <EmptyState title="뮤직비디오 스트리밍" lines={["아직 등록된 가이드가 없어요."]} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="download">
          <div className="mt-4 space-y-4">
            {mvDownloadItems.length ? (
              <Tabs defaultValue={mvDownloadItems[0]?.service.id ?? ""}>
                <div className="border-b border-foreground/10 pb-2">
                  <TabsList
                    aria-label="뮤직비디오 다운로드"
                    className="w-full flex-nowrap justify-start gap-6 overflow-x-auto rounded-none border-0 bg-transparent p-0 shadow-none"
                  >
                    {mvDownloadItems.map(({ service }) => (
                      <TabsTrigger key={service.id} value={service.id} variant="underline">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <span>{service.label}</span>
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                {mvDownloadItems.map(({ service, part }) => (
                  <TabsContent key={service.id} value={service.id}>
                    <Assets
                      title={`${service.label} · 뮤직비디오 다운로드`}
                      idKey={`guide-${service.id}-mv`}
                      assets={part.assets}
                      emptyLines={buildMvEmptyLines(service.id, service.label)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <EmptyState title="뮤직비디오 다운로드" lines={["아직 등록된 가이드가 없어요."]} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    );
  }

  const partId = categoryId as StreamingGuidePart["id"];
  const items = normalServices
    .map((service) => ({ service, part: findPart(service, partId) }))
    .filter((item): item is { service: StreamingGuideService; part: StreamingGuidePart } => Boolean(item.part));

  const defaultTab = items[0]?.service.id ?? "";

  return items.length ? (
    <Tabs defaultValue={defaultTab}>
      <div className="border-b border-foreground/10 pb-2">
        <TabsList
          aria-label="가이드 사이트"
          className="w-full flex-nowrap justify-start gap-6 overflow-x-auto rounded-none border-0 bg-transparent p-0 shadow-none"
        >
          {items.map(({ service }) => (
            <TabsTrigger key={service.id} value={service.id} variant="underline">
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <span>{service.label}</span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {items.map(({ service, part }) => (
        <TabsContent key={service.id} value={service.id}>
          <Assets
            title={`${service.label} · ${part.label}`}
            idKey={`guide-${service.id}-${part.id}`}
            assets={part.assets}
            emptyLines={buildEmptyLines(service.id, service.label, part.id, part.label)}
          />
        </TabsContent>
      ))}
    </Tabs>
  ) : (
    <EmptyState title="가이드" lines={["아직 등록된 가이드가 없어요."]} />
  );
}
