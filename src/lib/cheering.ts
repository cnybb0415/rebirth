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

// 타입·상수는 클라이언트에서도 쓸 수 있도록 별도 파일에서 관리
export type { CheeringSongAsset, LangKey } from "./cheering-types";
export { LANG_LABELS } from "./cheering-types";
import type { CheeringSongAsset, LangKey } from "./cheering-types";

export type CheeringSong = {
  id: string; // folder name under public/images/concert/cheering
  slug: string;
  label: string;
  order: number | null;
  coverSrc: string | null;
  youtubeUrl: string | null;
  hasGuide: boolean;
  guideAssets: CheeringSongAsset[];         // 전체 (하위 호환)
  guideByLang: Record<LangKey, CheeringSongAsset[]>; // 언어별
};

/** 파일명 suffix로 언어 키 판별 (_en/_eng, _zh/_cn, _ja/_jp 모두 지원) */
function getLangKey(filename: string): LangKey {
  const base = path.basename(filename, path.extname(filename));
  if (base.endsWith("_en") || base.endsWith("_eng")) return "en";
  if (base.endsWith("_zh") || base.endsWith("_cn"))  return "cn";
  if (base.endsWith("_ja") || base.endsWith("_jp"))  return "jp";
  return "ko";
}

const YOUTUBE_BY_SLUG: Record<string, string> = {
  mama: "https://youtu.be/w09ZCW9PmqU",
  wolf: "https://youtu.be/laco0v52Tt0",
  growl: "https://youtu.be/GsvwMGhxWJk",
  overdose: "https://youtu.be/m91io9Tq20E",
  "call-me-baby": "https://youtu.be/Z_jlOWwQEwQ",
  "love-me-right": "https://youtu.be/_4r9X6xt_P4",
  unfair: "https://youtu.be/wl6KA_oXbDQ",
  monster: "https://youtu.be/3qsSl7QyMr0",
  "lucky-one": "https://youtu.be/YuDTNwyD6t4",
  lotto: "https://youtu.be/gYiPVhOmLSo",
  "the-eve": "https://youtu.be/Ne0Pp--9Vhw",
  "ko-ko-bop": "https://youtu.be/yYI0slfCUC8",
  power: "https://youtu.be/aQB2Z2sIyy0",
  tempo: "https://youtu.be/BEHWjTw7FxY",
  "ooh-la-la-la": "https://youtu.be/xv5tuYBaVDI",
  "love-shot": "https://youtu.be/O0KIJWR5ItQ",
  obsession: "https://youtu.be/3F0RGDtnFkA",
  "cream-soda": "https://youtu.be/bR1cxmb9jkA",
  crown: "https://www.youtube.com/watch?v=BXf0D3xqltA&t=92",
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

      // 언어별로 분류
      const guideByLang: Record<LangKey, CheeringSongAsset[]> = {
        ko: [], en: [], cn: [], jp: [],
      };
      for (const file of guideFiles) {
        const lang = getLangKey(file);
        guideByLang[lang].push({
          type: "image",
          src: `/images/concert/cheering/${encodePathSegments(dirName, "guide", file)}`,
          alt: `${label} 응원법`,
        });
      }

      return {
        id: dirName,
        slug,
        label,
        order,
        coverSrc,
        youtubeUrl: YOUTUBE_BY_SLUG[slug] ?? null,
        hasGuide: guideAssets.length > 0,
        guideAssets,
        guideByLang,
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
