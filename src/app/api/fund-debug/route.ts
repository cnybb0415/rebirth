import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.FUND_SHEET_CSV_URL;
  if (!url) return NextResponse.json({ error: "env not set" });

  try {
    const res = await fetch(url);
    const text = await res.text();
    const lines = text.split("\n").slice(0, 6);
    const numberLine = text.split("\n").find((line) => /^\d/.test(line.trim()));
    const value = numberLine ? parseFloat(numberLine.split(",")[0].trim()) : NaN;

    return NextResponse.json({ lines, numberLine, value, status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
