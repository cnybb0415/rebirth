import type { LangKey, CheeringSongAsset } from "@/lib/cheering-types";

const ACCENT = "#ff4d8d";

interface Props {
  guideByLang: Record<LangKey, CheeringSongAsset[]>;
  songLabel: string;
  locale?: string;
}

const LANG_ORDER: LangKey[] = ["ko", "en", "cn", "jp"];

const LOCALE_TO_LANG: Record<string, LangKey> = {
  ko: "ko",
  en: "en",
  zh: "cn",
  ja: "jp",
};

export function CheerGuideViewer({ guideByLang, songLabel, locale }: Props) {
  const availableLangs = LANG_ORDER.filter((l) => guideByLang[l].length > 0);

  const preferredLang = locale ? (LOCALE_TO_LANG[locale] ?? "ko") : "ko";
  const activeLang = availableLangs.includes(preferredLang)
    ? preferredLang
    : (availableLangs[0] ?? "ko");

  if (availableLangs.length === 0) {
    return (
      <div
        style={{
          padding: "24px",
          border: `1.5px dashed ${ACCENT}44`,
          textAlign: "center",
          fontSize: "0.6rem",
          letterSpacing: "0.25em",
          color: "rgba(255,255,255,0.3)",
          fontWeight: 700,
          fontFamily: "'Mulmaru', 'PFStarDust', monospace",
        }}
      >
        COMING SOON
      </div>
    );
  }

  const assets = guideByLang[activeLang];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {assets.map((asset, idx) => (
        <div
          key={`${activeLang}-${idx}`}
          style={{
            overflow: "hidden",
            border: `1.5px solid ${ACCENT}55`,
            display: "block",
            width: "100%",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.src}
            alt={asset.alt ?? `${songLabel} 응원법`}
            style={{ display: "block", width: "100%", height: "auto" }}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
