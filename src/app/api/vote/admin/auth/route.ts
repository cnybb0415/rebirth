import { NextRequest, NextResponse } from "next/server";

// 비밀번호는 서버에만 존재 — 클라이언트 번들에 노출되지 않음
const ADMIN_PASSWORD = "rebirthdev389*exo0408";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "요청 오류" }, { status: 400 });
  }
}
