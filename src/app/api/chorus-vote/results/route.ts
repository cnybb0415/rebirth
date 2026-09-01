import { NextRequest, NextResponse } from "next/server";
import { getChorusVoteResults } from "@/lib/chorusVoteDb";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.CHORUS_ADMIN_TOKEN ?? process.env.CHORUS_ADMIN_PASSWORD;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  const results = await getChorusVoteResults();
  return NextResponse.json(results);
}
