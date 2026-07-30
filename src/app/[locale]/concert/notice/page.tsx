import { Link } from "@/i18n/navigation";
import { BinderPage, BinderHeading } from "@/components/concert/BinderPage";
import { announcements, getAnnouncementTitle } from "@/data/announcements";
import { getTranslations, setRequestLocale } from "next-intl/server";

const ACCENT = "#ff9b3d";

export default async function ConcertNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("concert");
  return (
    <BinderPage activeTab="notice" pixelFontFamily="'Mulmaru', 'PFStarDust', monospace" locale={locale}>
      <BinderHeading
        emoji="📋"
        title={t("noticeTitle")}
        subtitle="NOTICE"
        accentColor={ACCENT}
      />

      {/* 앵콜콘 확정 시 복구 */}
      <div style={{ padding: "48px 0", textAlign: "center" }}>
        <p style={{ fontSize: "0.42rem", letterSpacing: "0.45em", color: "rgba(255,255,255,0.2)", marginBottom: "14px" }}>· · · · ·</p>
        <p style={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.3em", color: "#ff9b3d", textShadow: "0 0 16px #ff9b3d66", marginBottom: "10px" }}>COMING SOON</p>
      </div>

      {false && (
        <>
          <div className="pb-6 space-y-[2px]">
            {announcements.length === 0 ? (
              <p
                style={{
                  fontSize: "0.65rem",
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.2em",
                  fontWeight: 400,
                  paddingTop: "16px",
                }}
              >
                {t("noNotice")}
              </p>
            ) : (
              announcements.filter((a) => a.id !== "2").map((item) => (
                <Link key={item.id} href={`/notice/${item.id}`} className="block group">
                  <div
                    className="py-3 border-b transition-all duration-150"
                    style={{ borderColor: `${ACCENT}44` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className="truncate leading-snug"
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.88)",
                            letterSpacing: "0.03em",
                          }}
                        >
                          {getAnnouncementTitle(item, locale)}
                        </p>
                        <p
                          className="mt-1"
                          style={{
                            fontSize: "0.55rem",
                            color: ACCENT,
                            letterSpacing: "0.15em",
                            fontWeight: 400,
                          }}
                        >
                          {item.date}
                        </p>
                      </div>
                      <svg
                        viewBox="0 0 24 24"
                        style={{
                          width: "12px",
                          height: "12px",
                          flexShrink: 0,
                          marginTop: "3px",
                          color: ACCENT,
                          opacity: 0.5,
                        }}
                        className="group-hover:opacity-100 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          {/* 노트 라인 */}
          <div className="space-y-[30px] pb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border-b border-white/8" style={{ minHeight: "20px" }} />
            ))}
          </div>
        </>
      )}
    </BinderPage>
  );
}
