import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/voteDb";
import { checkAdminAuth } from "@/lib/adminAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = checkAdminAuth(req);
  if (authErr) return authErr;

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const count = parseInt(body?.count, 10);
    if (!count || count < 1 || count > 1000) {
      return NextResponse.json({ error: "count는 1~1000 사이여야 합니다." }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.execute({ sql: "SELECT id FROM candidates WHERE id = ?", args: [numId] });
    if (!existing.rows[0]) {
      return NextResponse.json({ error: "후보자를 찾을 수 없습니다." }, { status: 404 });
    }

    const base = Date.now() % 1000000;
    const stmts = Array.from({ length: count }, (_, i) => {
      const n = base + i;
      const ip = `10.${Math.floor(n / 65536) % 256}.${Math.floor(n / 256) % 256}.${n % 256}`;
      return { sql: "INSERT INTO votes (candidate_id, voter_ip) VALUES (?, ?)", args: [numId, ip] };
    });
    await db.batch(stmts, "write");

    return NextResponse.json({ ok: true, added: count });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = checkAdminAuth(req);
  if (authErr) return authErr;

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
