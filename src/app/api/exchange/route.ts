import { NextRequest, NextResponse } from "next/server";
import {
  EXCHANGE_LIMITS,
  KEEP_AFTER_SHOW_DAYS,
  KEEP_ITEM_DAYS,
  PHOTO_CATEGORIES,
  hasMoney,
  isCategory,
  isShowDate,
  normalizeContact,
  type ContactType,
  type ItemRow,
  type TicketHave,
  type TicketWant,
} from "@/data/exchange";
import {
  countRecentByIp,
  createExchange,
  getDb,
  hashIp,
  hashPassword,
  listExchanges,
  photosExist,
  photoUrl,
  purgeExpired,
  type NewExchange,
} from "@/lib/exchangeDb";
import { ipOf, sameOrigin } from "@/lib/exchangeRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

class BadRequest extends Error {}

const PHONE = /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/;
const PHOTO_PATH = /^up\/\d{4}-\d{2}-\d{2}\/[a-f0-9]{32}\.webp$/;

function text(v: unknown, max: number, required = false): string | null {
  if (v == null || v === "") {
    if (required) throw new BadRequest();
    return null;
  }
  if (typeof v !== "string") throw new BadRequest();
  const s = v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!s) {
    if (required) throw new BadRequest();
    return null;
  }
  if (s.length > max) throw new BadRequest();
  if (PHONE.test(s)) throw new BadRequest("phone"); // 전화번호는 공개 게시판에 못 올림
  if (hasMoney(s)) throw new BadRequest("money"); // 돈 거래 금지, 교환만
  return s;
}

const rows = (v: unknown) => {
  if (!Array.isArray(v) || v.length < 1 || v.length > EXCHANGE_LIMITS.rows) throw new BadRequest();
  return v.map((r) => (r && typeof r === "object" ? (r as Record<string, unknown>) : ({} as Record<string, unknown>)));
};

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  if (!isCategory(category)) return NextResponse.json({ error: "invalid_category" }, { status: 400 });
  try {
    await purgeExpired().catch(() => {}); // 정리 실패해도 목록은 보여 줌
    const items = (await listExchanges(category)).map((it) => ({ ...it, photos: it.photos.map(photoUrl) }));
    return NextResponse.json({ items }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let row: NewExchange;
  try {
    const raw = await req.text();
    if (raw.length > 12_000) throw new BadRequest();
    const d = JSON.parse(raw) as Record<string, unknown>;
    if (d.website) return NextResponse.json({ ok: true }); // 봇용 숨김 칸

    const category = d.category;
    if (!isCategory(category)) throw new BadRequest();

    const etcLabel = category === "etc" ? text(d.etcLabel, EXCHANGE_LIMITS.etcLabel, true) : null;
    let eventName: string | null = null;
    let haves: ItemRow[] | TicketHave[];
    let wants: ItemRow[] | TicketWant[];
    let dates: string[] = [];

    if (category === "ticket") {
      eventName = text(d.eventName, EXCHANGE_LIMITS.event, true);
      const h: TicketHave[] = rows(d.haves).map((r) => {
        const qty = Number(r.qty);
        if (!Number.isInteger(qty) || qty < 1 || qty > EXCHANGE_LIMITS.qtyMax) throw new BadRequest();
        if (!isShowDate(r.date)) throw new BadRequest("date");
        return { date: r.date, seat: text(r.seat, EXCHANGE_LIMITS.seat) ?? "", qty };
      });
      const w: TicketWant[] = rows(d.wants).map((r) => {
        if (r.date !== "" && r.date != null && !isShowDate(r.date)) throw new BadRequest("date");
        const date = typeof r.date === "string" ? r.date : "";
        const seat = text(r.seat, EXCHANGE_LIMITS.seat) ?? "";
        if (!date && !seat) throw new BadRequest(); // 원하는 날짜나 좌석 중 하나는 있어야 함
        return { date, seat };
      });
      haves = h;
      wants = w;
      dates = [...new Set([...h.map((x) => x.date), ...w.map((x) => x.date).filter(Boolean)])].sort();
    } else {
      haves = rows(d.haves).map((r) => ({ text: text(r.text, EXCHANGE_LIMITS.item, true)! }));
      wants = rows(d.wants).map((r) => ({ text: text(r.text, EXCHANGE_LIMITS.item, true)! }));
    }

    let photos: string[] = [];
    if (d.photos != null) {
      if (!Array.isArray(d.photos) || d.photos.length > EXCHANGE_LIMITS.photos) throw new BadRequest();
      if (d.photos.length && !PHOTO_CATEGORIES.includes(category)) throw new BadRequest();
      photos = d.photos.map((p) => {
        if (typeof p !== "string" || !PHOTO_PATH.test(p)) throw new BadRequest();
        return p;
      });
      if (new Set(photos).size !== photos.length) throw new BadRequest();
    }

    const memo = text(d.memo, EXCHANGE_LIMITS.memo);

    const contactType = d.contactType as ContactType;
    if (contactType !== "x" && contactType !== "openchat") throw new BadRequest();
    const contact = typeof d.contact === "string" ? normalizeContact(contactType, d.contact) : null;
    if (!contact) throw new BadRequest("contact");

    const pw = typeof d.password === "string" ? d.password : "";
    if (!/^\d{6}$/.test(pw)) throw new BadRequest(); // 숫자 6자리
    if (d.agreed !== true) throw new BadRequest();

    const expires =
      category === "ticket"
        ? new Date(Date.parse(`${dates[dates.length - 1]}T23:59:59+09:00`) + KEEP_AFTER_SHOW_DAYS * 86_400_000)
        : new Date(Date.now() + KEEP_ITEM_DAYS * 86_400_000);

    row = {
      category,
      etc_label: etcLabel,
      event_name: eventName,
      haves,
      wants,
      dates,
      photos,
      contact_type: contactType,
      contact,
      memo,
      pw_hash: hashPassword(pw),
      ip_hash: hashIp(ipOf(req)),
      expires_at: expires.toISOString(),
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
    if (row.photos.length) {
      // 실제로 올라온 사진이고, 다른 글에 이미 쓰인 사진이 아니어야 함
      if (!(await photosExist(row.photos))) return NextResponse.json({ error: "photo_missing" }, { status: 400 });
      const { count } = await getDb()
        .from("exchange_posts")
        .select("id", { count: "exact", head: true })
        .overlaps("photos", row.photos);
      if (count) return NextResponse.json({ error: "photo_missing" }, { status: 400 });
    }
    const item = await createExchange(row);
    return NextResponse.json({ item: { ...item, photos: item.photos.map(photoUrl) } });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
