import { NextRequest, NextResponse } from "next/server";

function getAdminPassword(): string {
  const pw = process.env.VOTE_ADMIN_PASSWORD;
  if (!pw) throw new Error("VOTE_ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.");
  return pw;
}

function getAdminToken(): string {
  const token = process.env.VOTE_ADMIN_TOKEN;
  if (!token) throw new Error("VOTE_ADMIN_TOKEN 환경변수가 설정되지 않았습니다.");
  return token;
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (password === getAdminPassword()) {
      return NextResponse.json({ ok: true, token: getAdminToken() });
    }
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "요청 오류" }, { status: 400 });
  }
}
