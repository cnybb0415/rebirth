import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { fetchFullChartsData, type FullChartsData } from "@/lib/chartsFullData";
import type { ChartsData, ChartItem } from "@/lib/charts";

// 차트는 GitHub Actions(.github/workflows/charts-refresh.yml)가 매시 수집기를 직접 돌려
// DB(chart_snapshots)에 저장하고, 사이트는 저장본만 읽음.
// 받아오기에 실패한 차트는 직전에 성공한 순위를 그대로 둠.

const ID = "exo_full";
const REFRESH_EVERY_MS = 50 * 60_000; // 같은 시간대에 여러 번 불려도 한 번만 갱신

type Row = { id: string; data: FullChartsData; updated_at: string };

let _db: SupabaseClient | null = null;
function db(): SupabaseClient | null {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  _db ??= createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  return _db;
}

export async function readChartSnapshot(): Promise<{ data: FullChartsData; updatedAt: string } | null> {
  const client = db();
  if (!client) return null;
  const { data, error } = await client.from("chart_snapshots").select("data,updated_at").eq("id", ID).maybeSingle();
  if (error || !data) return null;
  return { data: (data as Row).data, updatedAt: (data as Row).updated_at };
}

export async function refreshChartSnapshot(force = false): Promise<{ status: "skipped" | "updated" | "failed"; updatedAt?: string }> {
  const client = db();
  if (!client) return { status: "failed" };

  const prev = await readChartSnapshot();
  if (!force && prev && Date.now() - Date.parse(prev.updatedAt) < REFRESH_EVERY_MS) {
    return { status: "skipped", updatedAt: prev.updatedAt };
  }

  const fresh = await fetchFullChartsData();

  // 실패한 차트는 직전 성공 순위로 채움
  const prevSections = new Map<string, FullChartsData["providers"][number]["sections"][number]>();
  prev?.data.providers.forEach((p) => p.sections.forEach((s) => prevSections.set(s.label, s)));
  let ok = 0;
  const providers = fresh.providers.map((p) => ({
    ...p,
    sections: p.sections.map((s) => {
      if (!s.error) {
        ok++;
        return s;
      }
      const old = prevSections.get(s.label);
      return old && !old.error ? { ...old, stale: true } : s;
    }),
  }));
  if (ok === 0 && prev) return { status: "failed", updatedAt: prev.updatedAt };

  const data: FullChartsData = { lastUpdated: fresh.lastUpdated, providers };
  const updatedAt = new Date().toISOString();
  const { error } = await client.from("chart_snapshots").upsert({ id: ID, data, updated_at: updatedAt });
  if (error) return { status: "failed" };
  return { status: "updated", updatedAt };
}

// 홈 요약: 차트마다 가장 높은 엑소 곡 하나
const SUMMARY_SECTIONS: Array<[string, string]> = [
  ["멜론 TOP100", "멜론 TOP100"],
  ["멜론 일간", "멜론 일간"],
  ["멜론 HOT100 (100일)", "멜론 HOT100 100일"],
  ["멜론 HOT100 (30일)", "멜론 HOT100 30일"],
  ["지니 실시간", "지니 TOP200"],
  ["지니 일간", "지니 일간"],
  ["벅스 실시간", "벅스 실시간"],
  ["플로 24시간", "플로 24시간"],
  ["바이브 급상승", "바이브 급상승"],
  ["바이브 오늘 TOP100", "바이브 오늘 TOP100"],
];

export function toSummary(data: FullChartsData): ChartsData {
  const byLabel = new Map<string, FullChartsData["providers"][number]["sections"][number]>();
  data.providers.forEach((p) => p.sections.forEach((s) => byLabel.set(s.label, s)));
  const items: ChartItem[] = SUMMARY_SECTIONS.map(([src, label]) => {
    const s = byLabel.get(src);
    const best = s?.items[0];
    if (!best) return { label, status: s?.error ? "-" : "차트 미진입" };
    return { label, rank: best.rank, title: best.title, rankStatus: best.rankStatus, changedRank: best.changedRank, count: s!.items.length };
  });
  return { lastUpdated: data.lastUpdated, items };
}
