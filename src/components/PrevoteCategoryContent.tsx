"use client";

import * as React from "react";
import { voteGuides, type GuideAsset } from "@/data/guides";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
            <img src={asset.src} alt={asset.alt ?? `가이드 이미지 ${idx + 1}`} className="h-auto w-full" loading="lazy" />
          </div>
        );
      })}
    </div>
  );
}

const logoMap: Record<string, string> = {
  musicbank: "/images/guides/vote/뮤직뱅크/logo/뮤직뱅크_logo.png",
  showchampion: "/images/guides/vote/쇼챔피언/logo/쇼챔피언_logo.png",
  mcountdown: "/images/guides/vote/엠카운트다운/logo/엠카운트다운_logo.png",
  musiccore: "/images/guides/vote/음악중심/logo/음악중심_logo.png",
  inkigayo: "/images/guides/vote/인기가요/logo/인기가요_logo.png",
};

const PROGRAM_GUIDES = [
  { id: "showchampion", label: "쇼챔피언" },
  { id: "mcountdown", label: "엠카운트다운" },
  { id: "musicbank", label: "뮤직뱅크" },
  { id: "musiccore", label: "음악중심" },
  { id: "inkigayo", label: "인기가요" },
];


function MusicBroadcastContent() {
  const commonGuide = voteGuides.find((g) => g.id === "common");
  const scheduleAssets = (commonGuide?.assets ?? []).filter(
    (a) => a.type === "image" && a.src.includes("사전투표")
  );
  const ratioAssets = (commonGuide?.assets ?? []).filter(
    (a) => a.type === "image" && a.src.includes("반영비율")
  );

  const [activeTab, setActiveTab] = React.useState<string>("schedule");
  const [detailOpen, setDetailOpen] = React.useState(false);

  const isProgramActive = PROGRAM_GUIDES.some((p) => p.id === activeTab);

  function handleTopTab(id: string) {
    setActiveTab(id);
  }

  function handleDetailToggle() {
    if (!detailOpen) {
      setDetailOpen(true);
      if (!isProgramActive) setActiveTab(PROGRAM_GUIDES[0]?.id ?? "schedule");
    } else {
      setDetailOpen(false);
      if (isProgramActive) setActiveTab("schedule");
    }
  }

  function handleProgram(id: string) {
    setActiveTab(id);
    setDetailOpen(true);
  }

  const getContent = () => {
    if (activeTab === "schedule") return <AssetList assets={scheduleAssets} idKey="music-schedule" />;
    if (activeTab === "ratio") return <AssetList assets={ratioAssets} idKey="music-ratio" />;
    const prog = PROGRAM_GUIDES.find((p) => p.id === activeTab);
    if (prog) {
      return (
        <AssetList
          assets={voteGuides.find((g) => g.id === prog.id)?.assets ?? []}
          idKey={`vote-${prog.id}`}
        />
      );
    }
    return null;
  };

  const sidebarItemClass = (active: boolean) =>
    [
      "flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
      active
        ? "bg-foreground/8 text-foreground"
        : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground",
    ].join(" ");

  return (
    <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start">
      {/* 사이드바 */}
      <div className="md:w-[210px] md:shrink-0 md:self-stretch">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => handleTopTab("schedule")}
                className={sidebarItemClass(activeTab === "schedule")}
              >
                사전투표 일정
              </button>
              <button
                type="button"
                onClick={() => handleTopTab("ratio")}
                className={sidebarItemClass(activeTab === "ratio")}
              >
                반영 비율
              </button>

              {/* 상세 가이드 토글 */}
              <button
                type="button"
                onClick={handleDetailToggle}
                className={sidebarItemClass(isProgramActive)}
              >
                <span className="flex-1 text-left">상세 가이드</span>
                <svg
                  viewBox="0 0 12 12"
                  className={[
                    "ml-1 h-3 w-3 shrink-0 transition-transform duration-200",
                    detailOpen ? "rotate-180" : "",
                  ].join(" ")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* 프로그램 목록 (아코디언) */}
              {detailOpen && (
                <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-foreground/10 pl-3">
                  {PROGRAM_GUIDES.map((prog) => (
                    <button
                      key={prog.id}
                      type="button"
                      onClick={() => handleProgram(prog.id)}
                      className={sidebarItemClass(activeTab === prog.id)}
                    >
                      <img
                        src={logoMap[prog.id]}
                        alt={prog.label + " 로고"}
                        className="mr-2 h-4 w-4 shrink-0"
                      />
                      <span className="whitespace-nowrap">{prog.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 콘텐츠 */}
      <div className="min-w-0 md:flex-1">{getContent()}</div>
    </div>
  );
}

function labelFromSrc(src: string): string {
  const filename = src.split("/").pop() ?? src;
  const stem = filename.replace(/\.[^.]+$/, "");
  return stem.replace(/_/g, " ");
}

function AwardContent() {
  const awardGuide = voteGuides.find((g) => g.id === "award");
  const assets = (awardGuide?.assets ?? []).filter((a): a is Extract<GuideAsset, { type: "image" }> => a.type === "image");
  const defaultTab = assets[0] ? labelFromSrc(assets[0].src) : "";

  if (!assets.length) {
    return <p className="py-6 text-center text-sm text-foreground/40">아직 가이드가 없어요.</p>;
  }

  return (
    <Tabs defaultValue={defaultTab}>
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start">
        <div className="md:w-[180px] md:shrink-0 md:self-stretch">
          <Card>
            <CardContent className="pt-0">
              <TabsList
                aria-label="시상식 가이드"
                className="flex flex-nowrap items-center gap-1 overflow-x-auto rounded-none border-0 bg-transparent p-0 pt-4 shadow-none md:flex-col md:items-stretch md:overflow-visible"
              >
                {assets.map((asset) => {
                  const label = labelFromSrc(asset.src);
                  return (
                    <TabsTrigger key={label} value={label} variant="sidebar" className="w-auto whitespace-nowrap md:w-full">
                      {label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </CardContent>
          </Card>
        </div>
        <div className="min-w-0 md:flex-1">
          {assets.map((asset) => {
            const label = labelFromSrc(asset.src);
            return (
              <TabsContent key={label} value={label} className="mt-0">
                <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.src} alt={asset.alt ?? label} className="h-auto w-full" loading="lazy" />
                </div>
              </TabsContent>
            );
          })}
        </div>
      </div>
    </Tabs>
  );
}

export function PrevoteCategoryContent({ categoryId }: { categoryId: PrevoteCategoryId }) {
  if (categoryId === "음악방송") {
    return <MusicBroadcastContent />;
  }

  return <AwardContent />;
}
