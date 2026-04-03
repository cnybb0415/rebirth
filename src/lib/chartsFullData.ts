import { siteConfig } from "@/config/site";

export type FullChartEntry = {
  rank: number;
  title: string;
  artist: string;
  albumArt?: string;
  rankStatus?: string;
  changedRank?: number;
};

export type ChartSection = {
  label: string;
  items: FullChartEntry[];
  error?: string;
};

export type FullChartProvider = {
  key: string;
  label: string;
  sections: ChartSection[];
};

export type FullChartsData = {
  lastUpdated: string;
  providers: FullChartProvider[];
};

type SectionDef = {
  label: string;
  buildEndpoint: (base: string, artist: string) => string;
};

type ProviderDef = {
  key: string;
  label: string;
  sections: SectionDef[];
};

const PROVIDER_DEFS: ProviderDef[] = [
  {
    key: "melon",
    label: "멜론",
    sections: [
      {
        label: "멜론 TOP100",
        buildEndpoint: (base, artist) => `${base}/melon/chart/${encodeURIComponent(artist)}`,
      },
      {
        label: "멜론 HOT100 (100일)",
        buildEndpoint: (base, artist) => `${base}/melon/hot100/D100/chart/${encodeURIComponent(artist)}`,
      },
      {
        label: "멜론 HOT100 (30일)",
        buildEndpoint: (base, artist) => `${base}/melon/hot100/D30/chart/${encodeURIComponent(artist)}`,
      },
    ],
  },
  {
    key: "genie",
    label: "지니",
    sections: [
      {
        label: "지니 실시간",
        buildEndpoint: (base, artist) => `${base}/genie/chart/${encodeURIComponent(artist)}`,
      },
      {
        label: "지니 일간",
        buildEndpoint: (base, artist) => `${base}/genie/chart/daily/${encodeURIComponent(artist)}`,
      },
      {
        label: "지니 주간",
        buildEndpoint: (base, artist) => `${base}/genie/chart/weekly/${encodeURIComponent(artist)}`,
      },
      {
        label: "지니 월간",
        buildEndpoint: (base, artist) => `${base}/genie/chart/monthly/${encodeURIComponent(artist)}`,
      },
    ],
  },
  {
    key: "bugs",
    label: "벅스",
    sections: [
      {
        label: "벅스 실시간",
        buildEndpoint: (base, artist) => `${base}/bugs/chart/${encodeURIComponent(artist)}`,
      },
      {
        label: "벅스 일간",
        buildEndpoint: (base, artist) => `${base}/bugs/chart/day/${encodeURIComponent(artist)}`,
      },
      {
        label: "벅스 주간",
        buildEndpoint: (base, artist) => `${base}/bugs/chart/week/${encodeURIComponent(artist)}`,
      },
    ],
  },
  {
    key: "flo",
    label: "플로",
    sections: [
      {
        label: "플로 24시간",
        buildEndpoint: (base, artist) => `${base}/flo/chart/${encodeURIComponent(artist)}`,
      },
    ],
  },
  {
    key: "vibe",
    label: "바이브",
    sections: [
      {
        label: "바이브 급상승",
        buildEndpoint: (base, artist) => `${base}/vibe/chart/${encodeURIComponent(artist)}`,
      },
      {
        label: "바이브 오늘 TOP100",
        buildEndpoint: (base, artist) => `${base}/vibe/chart/today/${encodeURIComponent(artist)}`,
      },
    ],
  },
];

function extractEntries(json: unknown): Array<{
  rank?: unknown;
  title?: unknown;
  artistName?: unknown;
  albumArt?: unknown;
  rankStatus?: unknown;
  changedRank?: unknown;
}> {
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object") {
    const data = (json as { data?: unknown }).data;
    if (Array.isArray(data)) return data;
  }
  return [];
}

function toNum(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function getKstNowIso(): string {
  const now = new Date();
  const kstMs = now.getTime() + KST_OFFSET_MS;
  const floored = kstMs - (kstMs % (60 * 60 * 1000)) + 60 * 1000;
  return new Date(floored - KST_OFFSET_MS).toISOString();
}

async function fetchSection(
  endpoint: string,
  sectionLabel: string,
  artistName: string
): Promise<ChartSection> {
  try {
    const res = await fetch(endpoint, { headers: { accept: "application/json" }, next: { revalidate: 3600 } });
    if (!res.ok) return { label: sectionLabel, items: [], error: "차트 연동 실패" };

    const json = (await res.json()) as unknown;
    const entries = extractEntries(json);
    const items: FullChartEntry[] = entries
      .flatMap((e) => {
        const rank = toNum(e.rank);
        if (typeof rank !== "number") return [];
        const title = typeof e.title === "string" ? e.title.trim() : "";
        if (!title) return [];
        return [{
          rank,
          title,
          artist: typeof e.artistName === "string" ? e.artistName.trim() : artistName,
          albumArt: typeof e.albumArt === "string" && e.albumArt.trim() ? e.albumArt.trim() : undefined,
          rankStatus: typeof e.rankStatus === "string" ? e.rankStatus : undefined,
          changedRank: toNum(e.changedRank),
        }];
      })
      .sort((a, b) => a.rank - b.rank);

    return { label: sectionLabel, items };
  } catch {
    return { label: sectionLabel, items: [], error: "서버 연결 실패" };
  }
}

export async function fetchFullChartsData(): Promise<FullChartsData> {
  const baseUrl = process.env.KOREA_MUSIC_CHART_API_BASE_URL;
  const artistName = siteConfig.artistName;

  if (!baseUrl) {
    return {
      lastUpdated: getKstNowIso(),
      providers: PROVIDER_DEFS.map((p) => ({
        key: p.key,
        label: p.label,
        sections: p.sections.map((s) => ({
          label: s.label,
          items: [],
          error: "서버 설정 필요 (KOREA_MUSIC_CHART_API_BASE_URL)",
        })),
      })),
    };
  }

  const providers = await Promise.all(
    PROVIDER_DEFS.map(async (def): Promise<FullChartProvider> => {
      const base = baseUrl.replace(/\/+$/, "");
      const sections = await Promise.all(
        def.sections.map((s) =>
          fetchSection(s.buildEndpoint(base, artistName), s.label, artistName)
        )
      );
      return { key: def.key, label: def.label, sections };
    })
  );

  return { lastUpdated: getKstNowIso(), providers };
}
