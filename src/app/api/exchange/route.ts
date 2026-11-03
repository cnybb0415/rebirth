import { NextRequest, NextResponse } from "next/server";
import {
  EXCHANGE_DATES,
  EXCHANGE_LIMITS,
  findDate,
  isDateOpen,
  normalizeContact,
  type ContactType,
  type ExchangeKind,
  type HaveRow,
  type WantRow,
} from "@/data/ticketExchange";
import { countRecentByIp, createExchange, hashIp, hashPassword, listExchanges, purgeExpiredExchanges } from "@/lib/exchangeDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

class BadRequest extends Error {}

const PHONE = /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/;

function text(v: unknown, max: number, required = false): string | null {
  if (v == null || v === "") {
    if (required) throw new BadRequest();
    return null;
  }
  if (typeof v !== "string") throw new BadRequest();
  const s = v.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (!s) {
    if (required) throw new BadRequest();
    return null;
  }
  if (s.length > max) throw new BadRequest();
  if (PHONE.test(s)) throw new BadRequest("phone"); // 전화번호는 공개 게시판에 못 올림
  return s;
}

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return !!origin && !!host && new URL(origin).host === host;
  } catch {
    return false;
  }
}

function ipOf(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function GET(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get("kind");
  if (kind !== "date" && kind !== "seat") return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
  try {
    await purgeExpiredExchanges().catch(() => {}); // 정리 실패해도 목록은 보여 줌
    const open = EXCHANGE_DATES.filter((d) => isDateOpen(d)).map((d) => d.id);
    const items = await listExchanges(kind, open);
    return NextResponse.json({ items }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let row: Parameters<typeof createExchange>[0];
  try {
    const raw = await req.text();
    if (raw.length > 8_000) throw new BadRequest();
    const d = JSON.parse(raw) as Record<string, unknown>;
    if (d.website) return NextResponse.json({ ok: true }); // 봇용 숨김 칸

    const kind = d.kind as ExchangeKind;
    if (kind !== "date" && kind !== "seat") throw new BadRequest();

    const rows = (v: unknown) => {
      if (!Array.isArray(v) || v.length < 1 || v.length > EXCHANGE_LIMITS.rows) throw new BadRequest();
      return v.map((r) => (r && typeof r === "object" ? (r as Record<string, unknown>) : ({} as Record<string, unknown>)));
    };
    const openDate = (id: unknown) => {
      const dt = typeof id === "string" ? findDate(id) : undefined;
      if (!dt || !isDateOpen(dt)) throw new BadRequest();
      return dt.id;
    };

    // 좌석 교환은 한 날짜 안에서만
    const seatDate = kind === "seat" ? openDate(d.seatDate) : null;

    const haves: HaveRow[] = rows(d.haves).map((r) => {
      const qty = Number(r.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > EXCHANGE_LIMITS.qtyMax) throw new BadRequest();
      return {
        date: seatDate ?? openDate(r.date),
        seat: text(r.seat, EXCHANGE_LIMITS.seat, kind === "seat") ?? "",
        qty,
      };
    });
    const haveDates = [...new Set(haves.map((h) => h.date))];

    const wants: WantRow[] = rows(d.wants).map((r) => {
      const date = seatDate ?? openDate(r.date);
      if (kind === "date" && haveDates.includes(date)) throw new BadRequest(); // 가진 날짜와 같은 날짜는 날짜 교환이 아님
      return { date, seat: text(r.seat, EXCHANGE_LIMITS.seat, kind === "seat") ?? "" };
    });

    const memo = text(d.memo, EXCHANGE_LIMITS.memo);

    const contactType = d.contactType as ContactType;
    if (contactType !== "x" && contactType !== "openchat") throw new BadRequest();
    const contact = typeof d.contact === "string" ? normalizeContact(contactType, d.contact) : null;
    if (!contact) throw new BadRequest("contact");

    const pw = typeof d.password === "string" ? d.password : "";
    if (!/^\d{6}$/.test(pw)) throw new BadRequest(); // 숫자 6자리

    row = {
      kind,
      haves,
      wants,
      have_dates: haveDates,
      want_dates: [...new Set(wants.map((x) => x.date))],
      contact_type: contactType,
      contact,
      memo,
      pw_hash: hashPassword(pw),
      ip_hash: hashIp(ipOf(req)),
    };
  } catch (e) {
    const code = e instanceof BadRequest && e.message ? e.message : "invalid";
    return NextResponse.json({ error: code }, { status: 400 });
  }

  try {
    // 한 사람이 1시간에 5개까지
    if ((await countRecentByIp(row.ip_hash, 60 * 60_000)) >= 5) {
      return NextResponse.json({ error: "too_many" }, { status: 429 });
    }
    const item = await createExchange(row);
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
