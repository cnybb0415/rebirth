import { NextRequest, NextResponse } from "next/server";
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  ConcertNotice,
} from "@/lib/adminDb";

export const runtime = "nodejs";

function auth(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.CHORUS_ADMIN_TOKEN ?? process.env.CHORUS_ADMIN_PASSWORD;
  return !!expected && token === expected;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  try {
    return NextResponse.json(await getNotices());
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  try {
    const body = (await req.json()) as Omit<ConcertNotice, "created_at">;
    await createNotice(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  try {
    const { id, ...patch } = (await req.json()) as { id: string } & Partial<ConcertNotice>;
    await updateNotice(id, patch);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  try {
    const { id } = (await req.json()) as { id: string };
    await deleteNotice(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
