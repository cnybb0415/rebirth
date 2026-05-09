"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { StreamingLinksGrid } from "@/components/StreamingLinksGrid";
import { OneClickStreamingGrid } from "@/components/OneClickStreamingGrid";

type MenuId = "recommended" | "oneclick" | "links";

type MenuTile = {
  id: MenuId;
  label: string;
  description: string;
  icon: "list" | "bolt" | "link";
  iconBgClassName: string;
};

const tiles: MenuTile[] = [
  {
    id: "recommended",
    label: "권장 스트리밍 리스트",
    description: "",
    icon: "list",
    iconBgClassName: "bg-lime-100",
  },
  {
    id: "oneclick",
    label: "원클릭 스트리밍",
    description: "",
    icon: "bolt",
    iconBgClassName: "bg-yellow-100",
  },
  {
    id: "links",
    label: "음원사이트 바로가기",
    description: "",
    icon: "link",
    iconBgClassName: "bg-sky-100",
  },
];

function IconList() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-foreground/80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 12h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 18h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3.5 6h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M3.5 12h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M3.5 18h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-foreground/80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-foreground/80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 13a5 5 0 0 1 0-7l1.2-1.2a5 5 0 0 1 7 7L17 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 0 1 0 7L12.8 19.2a5 5 0 0 1-7-7L7 11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TileIcon({ icon, label, bgClassName }: { icon: MenuTile["icon"]; label: string; bgClassName: string }) {
  return (
    <div className={`grid h-10 w-10 place-items-center rounded-xl ${bgClassName}`} aria-hidden>
      {icon === "list" ? <IconList /> : icon === "bolt" ? <IconBolt /> : <IconLink />}
      <span className="sr-only">{label}</span>
    </div>
  );
}

function MenuTileButton({ tile, isActive, onClick }: { tile: MenuTile; isActive: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={
        "flex w-full items-center gap-3 rounded-2xl border border-foreground/15 bg-white px-4 py-4 text-left shadow-sm transition hover:border-foreground/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25 " +
        (isActive ? "border-foreground/35" : "")
      }
    >
      <TileIcon icon={tile.icon} label={tile.label} bgClassName={tile.iconBgClassName} />
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{tile.label}</div>
        <div className="truncate text-xs text-foreground/70">{tile.description}</div>
      </div>
    </button>
  );
}

function RecommendedChecklist() {
  const [listImages, setListImages] = useState<Array<{ name: string; src: string }>>([]);

  const melonAndGenieLinks = useMemo(() => {
    return siteConfig.oneClickStreamingLinks.filter((l) => {
      const label = (l.label ?? "").trim();
      return label.startsWith("멜론") || label === "지니";
    });
  }, []);

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
        <CardTitle>권장 스트리밍 리스트</CardTitle>
      </CardHeader>
      <CardContent>
        {listImages.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-white">
            {listImages.map((img) => (
              <div key={img.src} className="border-b border-foreground/10 last:border-b-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.name}
                  className="h-auto w-full"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className={listImages.length > 0 ? "mt-4" : ""}>
          <div className="text-sm font-semibold">원클릭 스트리밍</div>
          <div className="mt-2">
            <OneClickStreamingGrid
              links={melonAndGenieLinks}
              columnsClassName="grid-cols-2 gap-2 sm:grid-cols-3"
              buttonVariant="secondary"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StreamingMenu() {
  const [activeId, setActiveId] = useState<MenuId>("recommended");
  const contentRef = useRef<HTMLDivElement | null>(null);

  const activeTile = useMemo(() => tiles.find((t) => t.id === activeId) ?? tiles[0], [activeId]);

  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeId]);

  return (
    <Card className="mt-6">
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {tiles.map((tile) => (
            <MenuTileButton
              key={tile.id}
              tile={tile}
              isActive={tile.id === activeId}
              onClick={() => setActiveId(tile.id)}
            />
          ))}
        </div>

        <div ref={contentRef} className="mt-4">
          {activeTile.id === "recommended" ? (
            <RecommendedChecklist />
          ) : activeTile.id === "oneclick" ? (
            <Card>
              <CardHeader>
                <CardTitle>원클릭 스트리밍</CardTitle>
              </CardHeader>
              <CardContent>
                <OneClickStreamingGrid
                  links={siteConfig.oneClickStreamingLinks}
                  columnsClassName="grid-cols-2 gap-2 sm:grid-cols-3"
                  buttonVariant="outline"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>음원사이트 바로가기</CardTitle>
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
