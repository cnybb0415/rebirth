import { NextResponse } from "next/server";
import { HELPER_DATES, HELPER_ROLES } from "@/data/helperRecruit";

// 헬퍼 신청 → Google Apps Script(구글시트) 중계
// - GOOGLE_SCRIPT_URL: Apps Script 웹 앱 URL (서버에만 존재, 브라우저로 노출 안 됨)
// - HELPER_SHEET_TOKEN: Apps Script 와 맞춘 비밀값. URL이 새어나가도 이 값 없이는 시트에 못 씀
// 설정 방법은 scripts/helper-sheet.gs 상단 참고

const MAX_BODY = 4_000; // bytes
// IP당 10분에 20회 (인스턴스 단위 best-effort). 통신사 모바일망은 여러 명이 IP를 공유해서 너무 낮추면 정상 신청이 막힘
const RATE_LIMIT = { max: 20, windowMs: 10 * 60_000 };
const hits = new Map<string, number[]>();

const PHONE = /^01[016789]-\d{3,4}-\d{4}$/;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

const DATE_LABELS = new Set(HELPER_DATES.map((d) => d.label));
const ROLE_LABELS = new Set(HELPER_ROLES.map((r) => r.label));
const SEAT_ROLES = new Set(HELPER_ROLES.filter((r) => r.needsSeat).map((r) => r.label));

class BadRequest extends Error {}

// 시트 수식 주입 차단: =, +, -, @ 등으로 시작하면 수식으로 실행돼 외부로 데이터가 새어나갈 수 있음
function cell(v: unknown, max: number): string {
  if (v == null || v === "") return "";
  if (typeof v !== "string") throw new BadRequest();
  const s = v.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (s.length > max) throw new BadRequest();
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

function pickList(v: unknown, allowed: Set<string>): string[] {
  if (typeof v !== "string") throw new BadRequest();
  const list = v.split(",").map((x) => x.trim()).filter(Boolean);
  if (list.length === 0 || list.some((x) => !allowed.has(x))) throw new BadRequest();
  return [...new Set(list)];
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > RATE_LIMIT.max;
}

export async function POST(request: Request) {
  // 다른 사이트에서 이 API로 몰래 제출하는 것 차단
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let sameOrigin = false;
  try {
    sameOrigin = !!origin && !!host && new URL(origin).host === host;
  } catch {}
  if (!sameOrigin) {
    return NextResponse.json({ error: "허용되지 않은 요청" }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  }

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    console.error("helper-apply: GOOGLE_SCRIPT_URL 미설정");
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
  }

  let row: Record<string, string>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) throw new BadRequest();
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") throw new BadRequest();

    // 봇이 채우는 숨김 칸: 값이 있으면 저장하지 않고 성공처럼 응답
    if (data.website) return NextResponse.json({ success: true });

    const companion = data.companionYn === "있음";
    const dates = pickList(data.dates, DATE_LABELS);
    const roles = pickList(data.roles, ROLE_LABELS);
    const needsSeat = roles.some((r) => SEAT_ROLES.has(r));
    // 날짜별 좌석: d7 → seat7, d8 → seat8 (helperRecruit.ts 날짜 설정을 따름)
    const seats: Record<string, string> = {};
    for (const d of HELPER_DATES) {
      const key = `seat${d.id.slice(1)}`;
      seats[key] = needsSeat && dates.includes(d.label) ? cell(data[key], 40) : "";
      if (needsSeat && dates.includes(d.label) && !seats[key]) throw new BadRequest();
    }

    row = {
      name: cell(data.name, 30),
      contact: cell(data.contact, 13),
      email: cell(data.email, 254),
      companionYn: companion ? "있음" : "없음",
      companionName: companion ? cell(data.companionName, 30) : "",
      companionContact: companion ? cell(data.companionContact, 13) : "",
      companionEmail: companion ? cell(data.companionEmail, 254) : "",
      dates: dates.join(", "),
      roles: roles.join(", "),
      ...seats,
    };

    if (!row.name || !PHONE.test(row.contact) || !EMAIL.test(row.email)) throw new BadRequest();
    if (companion && (!row.companionName || !PHONE.test(row.companionContact) || !EMAIL.test(row.companionEmail))) {
      throw new BadRequest();
    }
  } catch {
    return NextResponse.json({ error: "입력값을 확인해 주세요" }, { status: 400 });
  }

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...row, token: process.env.HELPER_SHEET_TOKEN ?? "" }),
      redirect: "follow",
      cache: "no-store",
    });
    const result = (await response.json().catch(() => null)) as { success?: boolean } | null;
    if (!response.ok || !result?.success) throw new Error(`Apps Script 응답 실패 (${response.status})`);
    return NextResponse.json({ success: true });
  } catch (err) {
    // 개인정보는 로그에 남기지 않음
    console.error("helper-apply 전송 실패:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "제출 실패" }, { status: 502 });
  }
}
