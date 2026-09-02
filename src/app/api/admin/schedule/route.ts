import { NextRequest, NextResponse } from "next/server";
import {
  getScheduleItems,
  createScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
  deleteAllScheduleItems,
  ScheduleItem,
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
    return NextResponse.json(await getScheduleItems());
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  try {
    const body = (await req.json()) as Omit<ScheduleItem, "created_at">;
    await createScheduleItem(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  try {
    const { id, ...patch } = (await req.json()) as { id: string } & Partial<ScheduleItem>;
    await updateScheduleItem(id, patch);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  try {
    const body = (await req.json()) as { id?: string; all?: boolean };
    if (body.all) {
      await deleteAllScheduleItems();
    } else if (body.id) {
      await deleteScheduleItem(body.id);
    } else {
      return NextResponse.json({ error: "id 또는 all 필요" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
