import { readChartSnapshot, toSummary } from "@/lib/chartSnapshot";

export const runtime = "nodejs";
export const revalidate = 300;

// 홈 요약용: 차트마다 가장 높은 엑소 곡 (저장본만 읽음, 차트 서버는 부르지 않음)
export async function GET(): Promise<Response> {
  const snap = await readChartSnapshot();
  if (!snap) return Response.json({ lastUpdated: new Date().toISOString(), items: [] }, { status: 503 });
  return Response.json(toSummary(snap.data), { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
