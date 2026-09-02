// 구글시트 CSV import — 더 이상 사용하지 않음. 스케줄은 어드민 대시보드에서 직접 관리.
// import { NextRequest, NextResponse } from "next/server";
// import { createScheduleItem } from "@/lib/adminDb";
// ...

export const runtime = "nodejs";

export async function POST() {
  return Response.json({ error: "이 엔드포인트는 비활성화되었습니다." }, { status: 410 });
}
