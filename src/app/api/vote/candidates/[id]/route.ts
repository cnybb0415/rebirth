import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/voteDb";
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

  const filePath = path.join(process.cwd(), "public", candidate.image_path);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return NextResponse.json({ ok: true });
}
