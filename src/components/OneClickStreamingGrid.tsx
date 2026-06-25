"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { MusicServiceIcon } from "@/components/MusicServiceIcon";

export type OneClickStreamingLink = {
  id: "melon" | "genie" | "bugs" | "flo" | "vibe" | "youtube" | string;
  label: string;
  iosHref?: string;
  androidHref?: string;
  webHref?: string;
};

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navAny = navigator as any;

  const ua = (navigator.userAgent ?? "").toLowerCase();
  const uaDataPlatform: string | undefined = navAny?.userAgentData?.platform;
  const platform = (uaDataPlatform ?? navigator.platform ?? "").toLowerCase();

  const isIOS = /iphone|ipad|ipod/.test(ua) || /iphone|ipad|ipod|ios/.test(platform);
  if (isIOS) return "ios";

  const isAndroid = /android/.test(ua) || /android/.test(platform);
  if (isAndroid) return "android";

  return "other";
}

function pickHref(link: OneClickStreamingLink, platform: Platform): string {
  const ios = (link.iosHref ?? "").trim();
  const android = (link.androidHref ?? "").trim();
  const web = (link.webHref ?? "").trim();

  // Important: don't cross-fallback between iOS and Android.
  // If a link is Android-only (or iOS-only), it should stay disabled on the other OS.
  if (platform === "ios") return ios || web;
  if (platform === "android") return android || web;
  return web;
}

function openHref(href: string): void {
  if (!href) return;

  // For universal links / http(s), open a new tab.
  if (/^https?:\/\//i.test(href)) {
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }

  // For app schemes (e.g., melon://, flo://), use location.
  window.location.href = href;
}

export function OneClickStreamingGrid({
  links,
  columnsClassName = "grid-cols-2 gap-2 sm:grid-cols-3",
  buttonVariant = "outline",
}: {
  links: ReadonlyArray<OneClickStreamingLink>;
  columnsClassName?: string;
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const [platform, setPlatform] = React.useState<Platform>("other");

  React.useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  return (
    <div className={`grid ${columnsClassName}`}>
      {links.map((link) => {
        const href = pickHref(link, platform);
        // 준비중: 모든 플랫폼에 링크가 아예 없음
        const isTrulyUnavailable = !link.iosHref && !link.androidHref && !link.webHref;
        const disabled = !href;

        return (
          <Button
            key={`${link.id}:${link.label}`}
            type="button"
            variant={buttonVariant}
            className="w-full"
            disabled={disabled}
            onClick={() => openHref(href)}
          >
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-[18px] w-[18px] items-center justify-center">
                <MusicServiceIcon label={link.label} size={18} className="relative top-[3px] h-[18px] w-[18px]" />
              </span>
              <span className="whitespace-nowrap">{link.label}</span>
              {isTrulyUnavailable ? (
                <span className="ml-1 text-xs text-foreground/50">(준비중)</span>
              ) : null}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
