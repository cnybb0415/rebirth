import { NextRequest, NextResponse } from "next/server";

/**
 * 어드민 API 공통 인증 헬퍼.
 * 요청 헤더 x-admin-token 이 VOTE_ADMIN_TOKEN 과 일치하지 않으면 401 반환.
 */
export function checkAdminAuth(req: NextRequest): NextResponse | null {
  const token = process.env.VOTE_ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
  }
  const provided = req.headers.get("x-admin-token");
  if (!provided || provided !== token) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  return null; // 인증 통과
}
