import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import sharp from "sharp";
import { EXCHANGE_LIMITS } from "@/data/exchange";
import { hashIp, photoUrl, uploadPhoto } from "@/lib/exchangeDb";
import { ipOf, sameOrigin } from "@/lib/exchangeRequest";

// 교환 글 사진 올리기 — 서버에서 다시 그려서(최대 1280px, webp) 위치정보 같은 사진 정보를 모두 지운 뒤 저장
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 서버 인스턴스마다 IP당 1시간 30장 (대충 막는 용도)
const recent = new Map<string, number[]>();
function tooMany(key: string) {
  const now = Date.now();
  const list = (recent.get(key) ?? []).filter((t) => now - t < 60 * 60_000);
  if (list.length >= 30) return true;
  list.push(now);
  recent.set(key, list);
  if (recent.size > 5000) recent.clear();
  return false;
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (tooMany(hashIp(ipOf(req)))) return NextResponse.json({ error: "too_many" }, { status: 429 });

  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > EXCHANGE_LIMITS.uploadBytes + 4096) return NextResponse.json({ error: "too_big" }, { status: 413 });

  let input: Buffer;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob) || file.size === 0 || file.size > EXCHANGE_LIMITS.uploadBytes) {
      return NextResponse.json({ error: "too_big" }, { status: 413 });
    }
    input = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  let out: Buffer;
  try {
    const meta = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
    if (!meta.format || !["jpeg", "png", "webp", "heif", "avif"].includes(meta.format)) {
      return NextResponse.json({ error: "not_image" }, { status: 400 });
    }
    out = await sharp(input, { limitInputPixels: 40_000_000, animated: false })
      .rotate() // 휴대폰 사진 방향 맞추기 (그 뒤 사진 정보는 저장하지 않음)
      .resize(1280, 1280, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "not_image" }, { status: 400 });
  }
  if (out.length > EXCHANGE_LIMITS.photoBytes) return NextResponse.json({ error: "too_big" }, { status: 413 });

  const day = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
  const path = `up/${day}/${randomBytes(16).toString("hex")}.webp`;
  try {
    await uploadPhoto(path, out);
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  return NextResponse.json({ path, url: photoUrl(path) });
}
