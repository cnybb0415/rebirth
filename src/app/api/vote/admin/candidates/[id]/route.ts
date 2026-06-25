import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/voteDb";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status } = body as { status?: string };
    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "status는 approved 또는 rejected여야 합니다." }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.execute({ sql: "SELECT id FROM candidates WHERE id = ?", args: [numId] });
    if (!existing.rows[0]) {
      return NextResponse.json({ error: "후보자를 찾을 수 없습니다." }, { status: 404 });
    }

    await db.execute({ sql: "UPDATE candidates SET status = ? WHERE id = ?", args: [status, numId] });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
