import { NextRequest, NextResponse } from "next/server";
import { adjustVoteCount } from "@/lib/chorusVoteDb";
import { chorusDays } from "@/data/chorusSongs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.CHORUS_ADMIN_TOKEN ?? process.env.CHORUS_ADMIN_PASSWORD;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { day, songId, amount } = (await req.json()) as { day?: unknown; songId?: unknown; amount?: unknown };

  const dayNum = Number(day);
  if (![1, 2].includes(dayNum)) {
    return NextResponse.json({ error: "invalid_day" }, { status: 400 });
  }

  const dayData = chorusDays.find((d) => d.day === dayNum);
  if (!dayData || !dayData.songs.some((s) => s.id === songId)) {
    return NextResponse.json({ error: "invalid_song" }, { status: 400 });
  }

  const amountNum = Number(amount);
  if (!Number.isInteger(amountNum) || amountNum <= 0) {
    return NextResponse.json({ error: "1 이상의 정수만 가능합니다." }, { status: 400 });
  }

  try {
    await adjustVoteCount(dayNum, String(songId), amountNum);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
