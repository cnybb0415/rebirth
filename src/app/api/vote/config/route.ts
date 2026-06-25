import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/voteDb";

export const dynamic = "force-dynamic";

interface ConfigRow {
  start_at: string;
  end_at: string;
  registration_open: number;
  approval_mode: number;
}

export async function GET() {
  const db = await getDb();
  const result = await db.execute(
    "SELECT start_at, end_at, registration_open, approval_mode FROM vote_config WHERE id = 1"
  );
  const config = (result.rows[0] as unknown as ConfigRow) ?? null;
  return NextResponse.json({ config });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { start_at, end_at, registration_open, approval_mode } = body as {
      start_at?: string;
      end_at?: string;
      registration_open?: boolean;
      approval_mode?: boolean;
    };

    const db = await getDb();

    // 날짜 없이 토글만 업데이트
    if (!start_at && !end_at) {
      const existing = await db.execute("SELECT id FROM vote_config WHERE id = 1");
      if (!existing.rows[0]) {
        return NextResponse.json({ error: "투표 기간을 먼저 설정해주세요." }, { status: 400 });
      }
      if (registration_open !== undefined) {
        await db.execute({
          sql: "UPDATE vote_config SET registration_open = ? WHERE id = 1",
          args: [registration_open ? 1 : 0],
        });
      }
      if (approval_mode !== undefined) {
        await db.execute({
          sql: "UPDATE vote_config SET approval_mode = ? WHERE id = 1",
          args: [approval_mode ? 1 : 0],
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (!start_at || !end_at) {
      return NextResponse.json({ error: "시작일시와 종료일시가 필요합니다." }, { status: 400 });
    }

    // 날짜 저장 시 기존 플래그 유지
    const existingResult = await db.execute(
      "SELECT registration_open, approval_mode FROM vote_config WHERE id = 1"
    );
    const existing = existingResult.rows[0] as unknown as { registration_open: number; approval_mode: number } | undefined;
    const regOpen = registration_open !== undefined ? (registration_open ? 1 : 0) : (existing?.registration_open ?? 1);
    const appMode = approval_mode !== undefined ? (approval_mode ? 1 : 0) : (existing?.approval_mode ?? 0);

    console.log("[vote/config POST] saving:", { start_at, end_at, regOpen, appMode });
    await db.execute({
      sql: `INSERT INTO vote_config (id, start_at, end_at, registration_open, approval_mode) VALUES (1, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              start_at = excluded.start_at,
              end_at = excluded.end_at,
              registration_open = excluded.registration_open,
              approval_mode = excluded.approval_mode`,
      args: [start_at, end_at, regOpen, appMode],
    });
    const saved = await db.execute("SELECT * FROM vote_config WHERE id = 1");
    console.log("[vote/config POST] saved row:", saved.rows[0]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
