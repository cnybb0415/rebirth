import Image from "next/image";

export type MusicServiceId = "melon" | "genie" | "bugs" | "flo" | "vibe" | "youtube" | "cheer" | "kakao music";

export function resolveMusicServiceIdFromLabel(label: string): MusicServiceId | null {
  const text = label.trim();
  if (!text) return null;

  if (text.includes("유튜브") || text.toLowerCase().includes("youtube")) return "youtube";
  if (text.includes("멜론") || text.toLowerCase().includes("melon")) return "melon";
  if (text.includes("지니") || text.toLowerCase().includes("genie")) return "genie";
  if (text.includes("벅스") || text.toLowerCase().includes("bugs")) return "bugs";
  if (text.includes("플로") || text.toLowerCase().includes("flo")) return "flo";
  if (text.includes("바이브") || text.toLowerCase().includes("vibe")) return "vibe";
  if (text.includes("카카오") || text.toLowerCase().includes("kakao")) return "kakao music";
  if (text.includes("응원법") || text.toLowerCase().includes("cheer")) return "cheer";

  return null;
}

export function MusicServiceIcon({
  service,
  label,
  size = 20,
  className,
}: {
  service?: MusicServiceId | null;
  label?: string;
  size?: number;
  className?: string;
}) {
  const resolved = service ?? (label ? resolveMusicServiceIdFromLabel(label) : null);
  if (!resolved) return null;

  const alt = label ? `${label} 로고` : `${resolved} 로고`;

  return (
    <Image
      src={`/images/icon/${encodeURIComponent(resolved)}.png`}
      alt={alt}
      width={size}
      height={size}
      className={className}
    />
  );
}
