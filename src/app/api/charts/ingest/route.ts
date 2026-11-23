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
        repositoryId: "1146719829",
        repositoryOwnerId: "78857618",
        ref: "refs/heads/main",
        workflowPath: ".github/workflows/charts-refresh.yml",
        events: ["schedule", "workflow_dispatch"],
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

  if (!isChartsPayload(data)) return NextResponse.json({ status: "bad_shape" }, { status: 400 });

  const result = await saveChartSnapshot(data);
  return NextResponse.json(result, { status: result.status === "updated" ? 200 : 500 });
}

// 받은 차트 모양 확인 (필드 종류·개수·길이 제한)
function isChartsPayload(d: unknown): d is FullChartsData {
  const str = (v: unknown, max = 300) => typeof v === "string" && v.length <= max;
  const optStr = (v: unknown, max = 300) => v === undefined || str(v, max);
  const optNum = (v: unknown) => v === undefined || (typeof v === "number" && Number.isFinite(v));
  if (!d || typeof d !== "object") return false;
  const x = d as FullChartsData;
  if (!str(x.lastUpdated, 40) || !Array.isArray(x.providers) || x.providers.length > 10) return false;
  return x.providers.every(
    (p) =>
      str(p.key, 20) &&
      str(p.label, 40) &&
      Array.isArray(p.sections) &&
      p.sections.length <= 10 &&
      p.sections.every(
        (s) =>
          str(s.label, 60) &&
          optStr(s.error, 200) &&
          Array.isArray(s.items) &&
          s.items.length <= 300 &&
          s.items.every(
            (i) =>
              typeof i.rank === "number" &&
              str(i.title, 200) &&
              str(i.artist, 200) &&
              (i.albumArt === undefined || (str(i.albumArt, 500) && /^https?:\/\//.test(i.albumArt))) &&
              optStr(i.rankStatus, 20) &&
              optNum(i.changedRank)
          )
      )
  );
}
