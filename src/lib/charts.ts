import localCharts from "@/data/charts.json";

export type ChartItem = {
  label: string;
  status?: string;
  rank?: number;
  prevRank?: number;
  rankStatus?: string;
  changedRank?: number;
};

export type ChartsData = {
  lastUpdated: string;
  items: ChartItem[];
};

function toAbsoluteUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  const baseFromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";

  const base = baseFromEnv.replace(/\/+$/, "");
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function secondsUntilNextKstTopOfHourPlusOneMin(now: Date): number {
  const kstMs = now.getTime() + KST_OFFSET_MS;
  const flooredKstMs = kstMs - (kstMs % (60 * 60 * 1000));
  const nextKstMs = flooredKstMs + 60 * 60 * 1000 + 60 * 1000;
  const utcMs = nextKstMs - KST_OFFSET_MS;
  const diffMs = Math.max(0, utcMs - now.getTime());
  return Math.max(60, Math.ceil(diffMs / 1000));
}

function isChartsData(value: unknown): value is ChartsData {
  if (!value || typeof value !== "object") return false;
  const data = value as { lastUpdated?: unknown; items?: unknown };
  if (typeof data.lastUpdated !== "string") return false;
  if (!Array.isArray(data.items)) return false;
  return data.items.every((item) => {
    if (!item || typeof item !== "object") return false;
    const i = item as {
      label?: unknown;
      status?: unknown;
      rank?: unknown;
      prevRank?: unknown;
      rankStatus?: unknown;
      changedRank?: unknown;
    };

    if (typeof i.label !== "string") return false;

    const hasValidStatus = i.status === undefined || typeof i.status === "string";
    const hasValidRank = i.rank === undefined || typeof i.rank === "number";
    const hasValidPrevRank =
      i.prevRank === undefined || typeof i.prevRank === "number";
    const hasValidRankStatus =
      i.rankStatus === undefined || typeof i.rankStatus === "string";
    const hasValidChangedRank =
      i.changedRank === undefined || typeof i.changedRank === "number";

    // Must have at least one displayable field.
    const hasAnyDisplay =
      typeof i.status === "string" || typeof i.rank === "number";

    return (
      hasValidStatus &&
      hasValidRank &&
      hasValidPrevRank &&
      hasValidRankStatus &&
      hasValidChangedRank &&
      hasAnyDisplay
    );
  });
}

export async function getChartsData(): Promise<ChartsData> {
  const overrideUrl = process.env.CHARTS_JSON_URL;
  const url = overrideUrl ? toAbsoluteUrl(overrideUrl) : toAbsoluteUrl("/api/charts");

  try {
    const revalidate = secondsUntilNextKstTopOfHourPlusOneMin(new Date());
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) return localCharts as ChartsData;

    const json = (await response.json()) as unknown;
    if (!isChartsData(json)) return localCharts as ChartsData;

    return json;
  } catch {
    return localCharts as ChartsData;
  }
}
