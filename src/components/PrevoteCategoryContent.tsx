"use client";

import { voteGuides, type GuideAsset } from "@/data/guides";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoteTabsWithSidebar } from "@/components/GuideTabs";
import { type PrevoteCategoryId } from "@/lib/prevoteCategories";

function AssetList({ assets, idKey }: { assets: GuideAsset[]; idKey: string }) {
  if (!assets.length) {
    return <p className="py-6 text-center text-sm text-foreground/40">아직 가이드가 없어요.</p>;
  }
  return (
    <div className="space-y-3">
      {assets.map((asset, idx) => {
        if (asset.type === "pdf") {
          return (
            <a key={idx} href={asset.href} target="_blank" rel="noopener noreferrer" className="block">
              <button type="button" className="flex w-full items-center justify-between rounded-lg border border-foreground/10 bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm">
                <span>{asset.label ?? "PDF 열기"}</span>
                <span className="text-xs text-foreground/70">새 탭</span>
              </button>
            </a>
          );
        }
        return (
          <div key={`${idKey}-${idx}`} className="overflow-hidden rounded-2xl border border-foreground/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.src} alt={asset.alt ?? `가이드 이미지 ${idx + 1}`} className="h-auto w-full" />
          </div>
        );
      })}
    </div>
  );
}

const MUSIC_SUBTABS = [
  { id: "schedule", label: "사전투표 일정" },
  { id: "ratio", label: "음악방송 반영 비율" },
  { id: "guide", label: "사전투표 가이드" },
] as const;

export function PrevoteCategoryContent({ categoryId }: { categoryId: PrevoteCategoryId }) {
  if (categoryId === "음악방송") {
    const commonGuide = voteGuides.find((g) => g.id === "common");
    const scheduleAssets = (commonGuide?.assets ?? []).filter(
      (a) => a.type === "image" && a.src.includes("사전투표")
    );
    const ratioAssets = (commonGuide?.assets ?? []).filter(
      (a) => a.type === "image" && a.src.includes("반영비율")
    );
    const programGuides = voteGuides.filter((g) => g.id !== "common" && g.id !== "award");

    return (
      <Tabs defaultValue="schedule">
        <div className="border-b border-foreground/10 pb-2">
          <TabsList
            aria-label="음악방송 가이드"
            className="w-full flex-nowrap justify-start gap-6 overflow-x-auto rounded-none border-0 bg-transparent p-0 shadow-none"
          >
            {MUSIC_SUBTABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} variant="underline">
                <span className="whitespace-nowrap">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="schedule">
          <div className="pt-4">
            <AssetList assets={scheduleAssets} idKey="music-schedule" />
          </div>
        </TabsContent>
        <TabsContent value="ratio">
          <div className="pt-4">
            <AssetList assets={ratioAssets} idKey="music-ratio" />
          </div>
        </TabsContent>
        <TabsContent value="guide">
          <VoteTabsWithSidebar guides={programGuides} />
        </TabsContent>
      </Tabs>
    );
  }

  if (categoryId === "시상식") {
    const awardGuide = voteGuides.find((g) => g.id === "award");
    return (
      <Card>
        <CardContent className="pt-4">
          <AssetList assets={awardGuide?.assets ?? []} idKey="prevote-award" />
        </CardContent>
      </Card>
    );
  }

  // 기타
  return (
    <Card>
      <CardContent className="pt-4">
        <AssetList assets={[]} idKey="prevote-etc" />
      </CardContent>
    </Card>
  );
}
