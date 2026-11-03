import { NextRequest, NextResponse } from "next/server";
import { deleteExchange, setExchangeStatus } from "@/lib/exchangeDb";

export const runtime = "nodejs";

const UUID = /^[0-9a-f-]{36}$/i;

async function readBody(req: NextRequest): Promise<{ password?: unknown; status?: unknown }> {
  try {
    return (await req.json()) as { password?: unknown; status?: unknown };
  } catch {
    return {};
  }
}

function forbiddenOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return !(origin && host && new URL(origin).host === host);
  } catch {
    return true;
  }
}

const result = (r: "ok" | "forbidden" | "not_found") =>
  r === "ok"
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: r === "forbidden" ? "wrong_password" : "not_found" }, { status: r === "forbidden" ? 403 : 404 });

// 교환 완료 / 다시 모집중
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (forbiddenOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await readBody(req);
  if (!UUID.test(id) || typeof body.password !== "string" || (body.status !== "open" && body.status !== "done")) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  try {
    return result(await setExchangeStatus(id, body.password, body.status));
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (forbiddenOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await readBody(req);
  if (!UUID.test(id) || typeof body.password !== "string") return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    return result(await deleteExchange(id, body.password));
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
