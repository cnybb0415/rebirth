import { getLiveChartsData } from "@/lib/chartsLive";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const data = await getLiveChartsData({
    artistName: url.searchParams.get("artist") || undefined,
    trackTitle: url.searchParams.get("track") || undefined,
    force: url.searchParams.get("force") === "1",
  });
  return Response.json(data, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
