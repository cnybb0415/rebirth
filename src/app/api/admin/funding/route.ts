import { NextRequest, NextResponse } from "next/server";
import { getFundingConfig, upsertFundingConfig } from "@/lib/adminDb";

export const runtime = "nodejs";

function auth(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.CHORUS_ADMIN_TOKEN ?? process.env.CHORUS_ADMIN_PASSWORD;
  return !!expected && token === expected;
}

export async function GET() {
  try {
    const config = await getFundingConfig();
    return NextResponse.json(config ?? { percent: 0, deadline: "", form_url: "", notice_images: [] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  try {
    const body = await req.json() as Partial<{ percent: number; deadline: string; form_url: string; notice_images: { src: string; alt: string }[] }>;
    await upsertFundingConfig(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
