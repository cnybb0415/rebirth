import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/voteDb";
import { del } from "@vercel/blob";
import path from "path";
import fs from "fs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT image_path FROM candidates WHERE id = ?",
    args: [numId],
  });
  const candidate = result.rows[0] as unknown as { image_path: string } | undefined;

  if (!candidate) {
    return NextResponse.json({ error: "후보자를 찾을 수 없습니다." }, { status: 404 });
  }

  await db.execute({ sql: "DELETE FROM candidates WHERE id = ?", args: [numId] });

  // Blob URL이면 Vercel Blob에서 삭제, 로컬 경로면 파일 삭제 (하위 호환)
  if (candidate.image_path.startsWith("https://")) {
    try { await del(candidate.image_path); } catch {}
  } else {
    const filePath = path.join(process.cwd(), "public", candidate.image_path);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }

  return NextResponse.json({ ok: true });
}
