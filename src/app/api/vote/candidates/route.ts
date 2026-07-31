import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/voteDb";
import { translateText } from "@/lib/translate";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;
// 파일 매직 바이트로 실제 포맷 검증
const MAGIC: Array<{ bytes: number[]; type: string }> = [
  { bytes: [0xff, 0xd8, 0xff], type: "image/jpeg" },
  { bytes: [0x89, 0x50, 0x4e, 0x47], type: "image/png" },
  { bytes: [0x52, 0x49, 0x46, 0x46], type: "image/webp" }, // RIFF header (webp)
];
function detectMime(buf: ArrayBuffer): string | null {
  const view = new Uint8Array(buf, 0, 12);
  for (const m of MAGIC) {
    if (m.bytes.every((b, i) => view[i] === b)) return m.type;
  }
  return null;
}

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
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const actualMime = detectMime(buffer);
    if (!actualMime || !ALLOWED_TYPES.includes(actualMime)) {
      return NextResponse.json({ error: "jpg, png, webp 파일만 업로드 가능합니다." }, { status: 400 });
    }

    const extMap: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    const ext = extMap[actualMime] ?? "jpg";
    const fileName = `vote-uploads/${Date.now()}.${ext}`;
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
