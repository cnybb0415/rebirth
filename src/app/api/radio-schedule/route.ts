import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const revalidate = 0;

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function isAllowedImageFile(name: string): boolean {
  const ext = path.extname(name).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

export async function GET() {
  try {
    const dirPath = path.join(process.cwd(), "public", "images", "radio", "schedule");
    const entries = await readdir(dirPath, { withFileTypes: true });

    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => !name.startsWith("."))
      .filter(isAllowedImageFile)
      .sort((a, b) => a.localeCompare(b, "ko"));

    const items = files.map((name) => ({
      name,
      src: `/images/radio/schedule/${encodeURIComponent(name)}`,
    }));

    return NextResponse.json({ items }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { items: [], error: message },
      { status: 200, headers: { "cache-control": "no-store" } }
    );
  }
}
