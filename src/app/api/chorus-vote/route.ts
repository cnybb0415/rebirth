import { NextRequest, NextResponse } from "next/server";
import { castChorusVote, hashVoterId } from "@/lib/chorusVoteDb";
import { chorusDays, isVotingOpen } from "@/data/chorusSongs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!isVotingOpen()) {
      return NextResponse.json({ error: "voting_closed" }, { status: 403 });
    }

    const { day, songId } = (await req.json()) as { day?: unknown; songId?: unknown };

    const dayNum = Number(day);
    if (![1, 2].includes(dayNum)) {
      return NextResponse.json({ error: "invalid_day" }, { status: 400 });
    }

    const dayData = chorusDays.find((d) => d.day === dayNum);
    if (!dayData || !dayData.songs.some((s) => s.id === songId)) {
      return NextResponse.json({ error: "invalid_song" }, { status: 400 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const voterId = hashVoterId(ip);

    const result = await castChorusVote(dayNum, String(songId), voterId);

    if (!result.ok && result.alreadyVoted) {
      return NextResponse.json({ error: "already_voted" }, { status: 409 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
