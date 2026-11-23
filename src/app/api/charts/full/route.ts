import { readChartSnapshot } from "@/lib/chartSnapshot";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(): Promise<Response> {
  const snap = await readChartSnapshot();
  if (!snap) return Response.json({ error: "no_data" }, { status: 503 });
  return Response.json(snap.data, { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
