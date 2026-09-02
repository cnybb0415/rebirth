import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// 인메모리 rate limit: IP당 5분 내 10회 초과 시 차단
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX = 10;
const WINDOW_MS = 5 * 60 * 1000;

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX;
}

function clearAttempts(ip: string) {
  attempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
  }

  try {
    const { password } = (await req.json()) as { password?: string };
    const correct = process.env.CHORUS_ADMIN_PASSWORD;
    if (!correct) return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
    if (password !== correct) {
      return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    }
    clearAttempts(ip);
    return NextResponse.json({ ok: true, token: process.env.CHORUS_ADMIN_TOKEN ?? correct });
  } catch {
    return NextResponse.json({ error: "요청 오류" }, { status: 400 });
  }
}
