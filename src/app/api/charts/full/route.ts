import { fetchFullChartsData } from "@/lib/chartsFullData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const data = await fetchFullChartsData();
  return Response.json(data, { headers: { "cache-control": "no-store" } });
}
