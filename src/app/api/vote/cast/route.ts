import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/voteDb";

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function todayKst(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidateId = Number(body?.candidate_id);
    if (!candidateId || isNaN(candidateId)) {
      return NextResponse.json({ error: "후보자 ID가 필요합니다." }, { status: 400 });
    }

    const db = await getDb();

    const configResult = await db.execute(
      "SELECT start_at, end_at FROM vote_config WHERE id = 1"
    );
    const config = configResult.rows[0] as unknown as { start_at: string; end_at: string } | undefined;

    if (!config) {
      return NextResponse.json({ error: "투표 기간이 설정되지 않았습니다." }, { status: 403 });
    }

    const now = Date.now();
    if (now < new Date(config.start_at).getTime() || now > new Date(config.end_at).getTime()) {
      return NextResponse.json({ error: "투표 기간이 아닙니다." }, { status: 403 });
    }

    const candidateResult = await db.execute({
      sql: "SELECT id, member FROM candidates WHERE id = ?",
      args: [candidateId],
    });
    if (!candidateResult.rows[0]) {
      return NextResponse.json({ error: "존재하지 않는 후보자입니다." }, { status: 404 });
    }
    const member = (candidateResult.rows[0] as unknown as { id: number; member: string }).member;

    const ip = getIp(req);
    const today = todayKst();

    // 같은 후보 중복 투표 방지
    const existingResult = await db.execute({
      sql: "SELECT id FROM votes WHERE voter_ip = ? AND candidate_id = ? AND date(voted_at, '+9 hours') = ?",
      args: [ip, candidateId, today],
    });
    if (existingResult.rows[0]) {
      return NextResponse.json(
        { error: "오늘 이미 이 후보에 투표하셨습니다." },
        { status: 409 }
      );
    }

    // 멤버당 하루 3표 제한
    const memberVoteResult = await db.execute({
      sql: `SELECT COUNT(*) as cnt
            FROM votes v
            JOIN candidates c ON v.candidate_id = c.id
            WHERE v.voter_ip = ? AND c.member = ? AND date(v.voted_at, '+9 hours') = ?`,
      args: [ip, member, today],
    });
    const memberVoteCount = Number((memberVoteResult.rows[0] as unknown as { cnt: number }).cnt);
    if (memberVoteCount >= 3) {
      return NextResponse.json(
        { error: `${member} 멤버에 오늘 이미 3표를 모두 사용하셨습니다. 내일 다시 투표해주세요.` },
        { status: 409 }
      );
    }

    await db.execute({
      sql: "INSERT INTO votes (candidate_id, voter_ip) VALUES (?, ?)",
      args: [candidateId, ip],
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
