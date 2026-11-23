"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { formatCompactNumber } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type YouTubeStats = {
  viewCount: number;
  likeCount: number;
  fetchedAt: string;
};

type YouTubeError = {
  error?: string;
  googleMessage?: string;
  googleReason?: string;
  upstreamStatus?: number;
};

const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedStats: { data: YouTubeStats; at: number } | null = null;
let inFlight: Promise<YouTubeStats> | null = null;

type State =
  | { status: "idle" | "loading" }
  | { status: "ready"; data: YouTubeStats }
  | { status: "error"; message: string };

async function fetchYouTubeStats(signal?: AbortSignal): Promise<YouTubeStats> {
  const now = Date.now();
  if (cachedStats && now - cachedStats.at < CLIENT_CACHE_TTL_MS) {
    return cachedStats.data;
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    const response = await fetch("/api/youtube", { signal });
    const json = (await response.json()) as unknown;

  if (!response.ok) {
    const err = json as YouTubeError;
    const message =
      typeof err.googleReason === "string"
        ? `${err.googleReason}${typeof err.googleMessage === "string" ? `: ${err.googleMessage}` : ""}`
        : typeof err.googleMessage === "string"
          ? err.googleMessage
          : typeof err.error === "string"
            ? err.error
            : "Failed";
    throw new Error(message);
  }

    const data = json as Partial<YouTubeStats>;
    const resolved = {
      viewCount: Number(data.viewCount ?? 0),
      likeCount: Number(data.likeCount ?? 0),
      fetchedAt: typeof data.fetchedAt === "string" ? data.fetchedAt : "",
    };
    cachedStats = { data: resolved, at: Date.now() };
    return resolved;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

export function YouTubeStatsCards({
  variant = "cards",
}: {
  variant?: "cards" | "inline" | "mv";
}) {
  const tc = useTranslations("common");
  const locale = useLocale();
  const [state, setState] = React.useState<State>({ status: "idle" });

  React.useEffect(() => {
    const controller = new AbortController();

    setState({ status: "loading" });
    fetchYouTubeStats(controller.signal)
      .then((data) => setState({ status: "ready", data }))
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : "Failed to load";
        setState({ status: "error", message });
      });

    return () => controller.abort();
  }, []);

  const ready = state.status === "ready";
  const errored = state.status === "error";

  if (variant === "mv") {
    const num = (n: number) => n.toLocaleString("en-US");
    return (
      <a
        href="https://youtu.be/BWfKkqo1Mk8"
        target="_blank"
        rel="noopener noreferrer"
        className="relative block h-[150px] overflow-hidden rounded-[18px] bg-[#0d0d10]"
      >
        {/* 사진은 오른쪽에, 숫자는 왼쪽 빈 곳에 → 멤버 얼굴을 가리지 않게 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home/mv_card.jpg"
          alt=""
          className="absolute inset-y-0 right-0 h-full w-[62%] object-cover object-[center_22%]"
        />
        <span aria-hidden className="absolute inset-y-0 left-[38%] w-[14%] bg-gradient-to-r from-[#0d0d10] to-transparent" />
        <span className="relative z-10 flex h-full w-[52%] flex-col justify-center pl-5 text-[#fff8ef]">
          <span className="text-[11px] tracking-wide opacity-85">CROWN M/V</span>
          <span className="mt-2 flex flex-col gap-2.5">
            <span>
              <span className="font-display block text-[26px] leading-none tracking-[0.02em] tabular-nums">
                {ready ? num(state.data.viewCount) : errored ? "-" : "···"}
              </span>
              <span className="mt-1 block text-[10px] opacity-80">{tc("viewCount")}</span>
            </span>
            <span>
              <span className="font-display block text-[26px] leading-none tracking-[0.02em] tabular-nums">
                {ready ? num(state.data.likeCount) : errored ? "-" : "···"}
              </span>
              <span className="mt-1 block text-[10px] opacity-80">{tc("likes")}</span>
            </span>
          </span>
        </span>
      </a>
    );
  }

  if (variant === "inline") {
    return (
      <div className="grid grid-cols-2 items-center gap-3 border-t border-foreground/10 px-1 pt-3 text-sm">
        <div className="flex items-center justify-center gap-2 text-center">
          <span className="text-foreground/60">{tc("viewCount")}</span>
          <span className="font-semibold tabular-nums">
            {ready ? (
              formatCompactNumber(state.data.viewCount, locale)
            ) : errored ? (
              tc("loadFail")
            ) : (
              <Skeleton className="h-5 w-16" />
            )}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 text-center">
          <span className="text-foreground/60">{tc("likes")}</span>
          <span className="font-semibold tabular-nums">
            {ready ? (
              formatCompactNumber(state.data.likeCount, locale)
            ) : errored ? (
              tc("loadFail")
            ) : (
              <Skeleton className="h-5 w-16" />
            )}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-foreground">{tc("viewCount")}</div>
          <div className="mt-1 text-xl font-semibold">
            {ready ? (
              formatCompactNumber(state.data.viewCount, locale)
            ) : errored ? (
              tc("loadFail")
            ) : (
              <Skeleton className="mt-1 h-7 w-28" />
            )}
          </div>
          {errored && (
            <div className="mt-2 text-xs text-foreground">{state.message}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-foreground">{tc("likes")}</div>
          <div className="mt-1 text-xl font-semibold">
            {ready ? (
              formatCompactNumber(state.data.likeCount, locale)
            ) : errored ? (
              tc("loadFail")
            ) : (
              <Skeleton className="mt-1 h-7 w-24" />
            )}
          </div>
          {errored && (
            <div className="mt-2 text-xs text-foreground">{state.message}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
