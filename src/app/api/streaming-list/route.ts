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
    const dirPath = path.join(process.cwd(), "public", "images", "streaming", "list");
    const entries = await readdir(dirPath, { withFileTypes: true });

    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => !name.startsWith("."))
      .filter(isAllowedImageFile)
      .sort((a, b) => a.localeCompare(b, "ko"));

    const items = files.map((name) => ({
      name,
      src: `/images/streaming/list/${encodeURIComponent(name)}`,
    }));

    return NextResponse.json({ items }, { headers: { "cache-control": "no-store" } });
  } catch {
    // readdir 실패 시 알려진 파일 폴백
    const fallback = [{ name: "streaming_list.png", src: "/images/streaming/list/streaming_list.png" }];
    return NextResponse.json({ items: fallback }, { headers: { "cache-control": "no-store" } });
  }
}
