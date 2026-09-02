import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const BUCKET = "notices";

function auth(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.CHORUS_ADMIN_TOKEN ?? process.env.CHORUS_ADMIN_PASSWORD;
  return !!expected && token === expected;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 버킷 없으면 자동 생성
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string | null) ?? "concert";

  if (!file) return NextResponse.json({ error: "파일 없음" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "이미지 파일만 업로드 가능합니다." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl, path: data.path });
}
