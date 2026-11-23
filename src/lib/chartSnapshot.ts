import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { FullChartsData } from "@/lib/chartsFullData";
import type { ChartsData, ChartItem } from "@/lib/charts";

// 차트는 GitHub Actions(.github/workflows/charts-refresh.yml)가 매시 수집기를 직접 돌려
// /api/charts/ingest로 보내면(GitHub 인증 토큰으로 확인) DB(chart_snapshots)에 저장하고, 사이트는 저장본만 읽음.
// 받아오기에 실패한 차트는 직전에 성공한 순위를 그대로 둠.

const ID = "exo_full";

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

// 새로 받은 차트를 저장. 실패한 차트는 직전 성공 순위로 채움
export async function saveChartSnapshot(fresh: FullChartsData): Promise<{ status: "updated" | "failed"; updatedAt?: string }> {
  const client = db();
  if (!client) return { status: "failed" };
  if (!fresh || !Array.isArray(fresh.providers)) return { status: "failed" };

  const prev = await readChartSnapshot();
  const prevSections = new Map<string, FullChartsData["providers"][number]["sections"][number]>();
  prev?.data.providers.forEach((p) => p.sections.forEach((s) => prevSections.set(s.label, s)));
  let ok = 0;
  const providers = fresh.providers.map((p) => ({
    ...p,
    sections: p.sections.map((s) => {
      if (!s.error) {
        ok++;
        return { ...s, stale: undefined };
      }
      const old = prevSections.get(s.label);
      return old && !old.error ? { ...old, stale: true } : s;
    }),
  }));
  if (ok === 0) return { status: "failed", updatedAt: prev?.updatedAt };

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
