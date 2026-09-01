import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { password } = (await req.json()) as { password?: string };
    const correct = process.env.CHORUS_ADMIN_PASSWORD;
    if (!correct) return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
    if (password !== correct) {
      return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    }
    return NextResponse.json({ ok: true, token: process.env.CHORUS_ADMIN_TOKEN ?? correct });
  } catch {
    return NextResponse.json({ error: "요청 오류" }, { status: 400 });
  }
}
