import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/voteDb";
import { translateText } from "@/lib/translate";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();

    const configResult = await db.execute(
      "SELECT registration_open, approval_mode FROM vote_config WHERE id = 1"
    );
    const config = configResult.rows[0] as unknown as {
      registration_open: number;
      approval_mode: number;
    } | undefined;

    if (config && config.registration_open === 0) {
      return NextResponse.json({ error: "현재 캐릭터 생성이 중단되었습니다." }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get("image") as File | null;
    const title = (form.get("title") as string | null)?.trim();
    const member = (form.get("member") as string | null)?.trim();
    const description = (form.get("description") as string | null)?.trim() ?? "";

    if (!file || !title || !member) {
      return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "jpg, png, webp 파일만 업로드 가능합니다." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `vote-uploads/${Date.now()}.${ext}`;
    const buffer = await file.arrayBuffer();
    const blob = await put(fileName, buffer, { access: "public", contentType: file.type });

    const status = config?.approval_mode === 1 ? "pending" : "approved";

    const result = await db.execute({
      sql: "INSERT INTO candidates (title, member, description, image_path, status) VALUES (?, ?, ?, ?, ?)",
      args: [title, member, description, blob.url, status],
    });
    const newId = Number(result.lastInsertRowid);

    if (description) {
      const [koText, enText] = await Promise.all([
        translateText(description, "KO"),
        translateText(description, "EN-US"),
      ]);
      await db.execute({
        sql: "UPDATE candidates SET description_ko = ?, description_en = ? WHERE id = ?",
        args: [koText, enText, newId],
      });
    }

    return NextResponse.json({ id: newId, status }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
