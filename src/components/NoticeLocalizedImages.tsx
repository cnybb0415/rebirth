import type { AnnouncementContentLine } from "@/data/announcements";

type NoticeLocalizedImagesProps = {
  itemId: string;
  sections: Array<{
    label: string;
    images: Array<{ src: string; alt: string }>;
    content?: AnnouncementContentLine[];
  }>;
  fallbackContent: AnnouncementContentLine[];
  dark?: boolean;
  locale?: string;
};

const LOCALE_TO_LABEL: Record<string, string> = {
  ko: "한국어",
  en: "English",
  zh: "中文",
  ja: "日本語",
};

export function NoticeLocalizedImages({
  itemId,
  sections,
  fallbackContent,
  dark = false,
  locale,
}: NoticeLocalizedImagesProps) {
  const preferredLabel = locale ? (LOCALE_TO_LABEL[locale] ?? "한국어") : "한국어";
  const preferredIndex = sections.findIndex((s) => s.label === preferredLabel);
  const selectedIndex =
    preferredIndex >= 0
      ? preferredIndex
      : Math.max(0, sections.findIndex((s) => s.label === "한국어"));

  const current = sections[selectedIndex];
  if (!current) return null;

  const currentContent = current.content ?? fallbackContent;

  if (dark) {
    return (
      <div>
        <div className="space-y-3">
          {current.images.map((image, idx) => (
            <div
              key={`${itemId}-${selectedIndex}-image-${idx}`}
              className="overflow-hidden"
              style={{ border: "1.5px solid rgba(255,215,0,0.3)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt}
                className="h-auto w-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div
          className="mt-4 space-y-2"
          style={{ fontSize: "0.68rem", lineHeight: 1.8, color: "rgba(255,255,255,0.9)" }}
        >
          {currentContent.map((line, idx) => {
            if (typeof line === "string") {
              return line.trim().length === 0 ? (
                <div key={`${itemId}-${selectedIndex}-spacer-${idx}`} className="h-2" aria-hidden />
              ) : (
                <p key={`${itemId}-${selectedIndex}-line-${idx}`}>{line}</p>
              );
            }
            return line.text.trim().length === 0 ? (
              <div key={`${itemId}-${selectedIndex}-spacer-${idx}`} className="h-2" aria-hidden />
            ) : (
              <p
                key={`${itemId}-${selectedIndex}-line-${idx}`}
                style={{
                  fontWeight: line.emphasis ? 700 : 400,
                  color: line.emphasis ? "#ffd700" : "rgba(255,255,255,0.9)",
                }}
              >
                {line.text}
              </p>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mt-4 grid gap-4">
        {current.images.map((image, idx) => (
          <div key={`${itemId}-${selectedIndex}-image-${idx}`} className="overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} alt={image.alt} className="h-auto w-full object-contain" loading="lazy" />
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 text-sm text-foreground/80">
        {currentContent.map((line, idx) => {
          if (typeof line === "string") {
            return line.trim().length === 0 ? (
              <div key={`${itemId}-${selectedIndex}-spacer-${idx}`} className="h-3" aria-hidden />
            ) : (
              <p key={`${itemId}-${selectedIndex}-line-${idx}`}>{line}</p>
            );
          }
          return line.text.trim().length === 0 ? (
            <div key={`${itemId}-${selectedIndex}-spacer-${idx}`} className="h-3" aria-hidden />
          ) : (
            <p
              key={`${itemId}-${selectedIndex}-line-${idx}`}
              className={line.emphasis ? "font-semibold" : undefined}
            >
              {line.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
