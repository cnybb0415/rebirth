import { readdir } from "node:fs/promises";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function isAllowedImageFile(name: string): boolean {
  const ext = path.extname(name).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

function encodePathSegments(...segments: string[]): string {
  return segments.map((s) => encodeURIComponent(s)).join("/");
}

function parseLeadingNumber(name: string): number | null {
  // Examples:
  // - "01.늑대와 미녀 (Wolf)" -> 1
  // - "16.Cream Soda" -> 16
  const match = name.match(/^\s*(\d{1,3})\s*[.\-_\s]/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

function stripLeadingNumber(name: string): string {
  return name.replace(/^\s*\d{1,3}\s*[.\-_\s]+/, "").trim();
}

function extractEnglishTitle(name: string): string {
  const target = stripLeadingNumber(name);
  const parenMatches = [...target.matchAll(/\(([^)]+)\)/g)].map((m) => m[1]);
  const englishInParens = parenMatches.filter((value) => /[A-Za-z]/.test(value));

  if (englishInParens.length) {
    return englishInParens[englishInParens.length - 1].trim();
  }

  return target
    .replace(/[^A-Za-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toSlug(name: string): string {
  const stripped = stripLeadingNumber(name);
  const hasHangul = /[\uAC00-\uD7A3]/.test(stripped);
  const base = hasHangul ? extractEnglishTitle(name) : stripped;

  return base
    .replace(/[.]/g, "")
    .replace(/[()]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .toLowerCase();
}

export type CheeringSongAsset = {
  type: "image";
  src: string;
  alt: string;
};

export type CheeringSong = {
  id: string; // folder name under public/images/concert/cheering
  slug: string;
  label: string;
  order: number | null;
  coverSrc: string | null;
  hasGuide: boolean;
  guideAssets: CheeringSongAsset[];
};

async function listFilesIfExists(dirPath: string): Promise<string[]> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function getCheeringSongs(): Promise<CheeringSong[]> {
  const rootDir = path.join(process.cwd(), "public", "images", "concert", "cheering");
  const entries = await readdir(rootDir, { withFileTypes: true });

  const dirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => !name.startsWith("."));

  const songs = await Promise.all(
    dirs.map(async (dirName) => {
      const order = parseLeadingNumber(dirName);
      const label = stripLeadingNumber(dirName) || dirName;
      const slug = toSlug(dirName);

      const albumArtDir = path.join(rootDir, dirName, "album-art");
      const guideDir = path.join(rootDir, dirName, "guide");

      const albumFiles = (await listFilesIfExists(albumArtDir))
        .filter((n) => !n.startsWith("."))
        .filter(isAllowedImageFile)
        .sort((a, b) => a.localeCompare(b, "ko"));

      const guideFiles = (await listFilesIfExists(guideDir))
        .filter((n) => !n.startsWith("."))
        .filter(isAllowedImageFile)
        .sort((a, b) => a.localeCompare(b, "ko"));

      const coverSrc = albumFiles.length
        ? `/images/concert/cheering/${encodePathSegments(dirName, "album-art", albumFiles[0])}`
        : null;

      const guideAssets: CheeringSongAsset[] = guideFiles.map((file) => ({
        type: "image",
        src: `/images/concert/cheering/${encodePathSegments(dirName, "guide", file)}`,
        alt: `${label} 응원법`,
      }));

      return {
        id: dirName,
        slug,
        label,
        order,
        coverSrc,
        hasGuide: guideAssets.length > 0,
        guideAssets,
      } satisfies CheeringSong;
    })
  );

  // Sort by leading number DESC (reverse order), then by label.
  songs.sort((a, b) => {
    const ao = a.order;
    const bo = b.order;

    if (ao != null && bo != null) return bo - ao;
    if (ao != null) return -1;
    if (bo != null) return 1;

    return a.label.localeCompare(b.label, "ko");
  });

  return songs;
}

export async function getCheeringSongById(id: string): Promise<CheeringSong | null> {
  const songs = await getCheeringSongs();

  // The URL segment may be encoded; we try best-effort decode.
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    // ignore
  }

  return songs.find((s) => s.slug === decoded) ?? null;
}
