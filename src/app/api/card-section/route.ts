import { NextRequest, NextResponse } from "next/server";
import { CARD_DAYS } from "@/data/cardSectionDays";
import cardData from "@/data/card-section.json";

export const dynamic = "force-dynamic";

// 서버 시계(한국시간 기준 공개 시각과 비교)로 공개된 날짜만 내려줌
// ?meta=1 이면 시각·공개 목록만 (메뉴 표시용, 가벼움)
export async function GET(req: NextRequest) {
  const now = Date.now();
  const open = CARD_DAYS.filter((d) => now >= Date.parse(d.openAt)).map((d) => d.id);
  const headers = { "cache-control": "no-store" };
  if (req.nextUrl.searchParams.get("meta")) return NextResponse.json({ now, open }, { headers });
  const all = cardData as Record<string, unknown>;
  const data = Object.fromEntries(open.filter((id) => id in all).map((id) => [id, all[id]]));
  return NextResponse.json({ now, open, data }, { headers });
}
