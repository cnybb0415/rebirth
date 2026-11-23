import { NextResponse } from "next/server";
import { saveChartSnapshot } from "@/lib/chartSnapshot";
import { verifyGithubOidc } from "@/lib/githubOidc";
import type { FullChartsData } from "@/lib/chartsFullData";

// 매시 GitHub Actions(charts-refresh)가 모은 차트를 받아 저장
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const claims = token
    ? await verifyGithubOidc(token, {
        audience: "exo-rebirth-charts",
        repository: "cnybb0415/rebirth",
        ref: "refs/heads/main",
        workflowPath: ".github/workflows/charts-refresh.yml",
      }).catch(() => null)
    : null;
  if (!claims) return NextResponse.json({ status: "unauthorized" }, { status: 401 });

  const text = await req.text();
  if (text.length > 500_000) return NextResponse.json({ status: "too_large" }, { status: 413 });
  let data: FullChartsData;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json({ status: "bad_json" }, { status: 400 });
  }

  const result = await saveChartSnapshot(data);
  return NextResponse.json(result, { status: result.status === "updated" ? 200 : 500 });
}
