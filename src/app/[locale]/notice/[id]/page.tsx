import { notFound } from "next/navigation";
import { getNoticeByIdForSite, getPublishedNoticesForSite, type AnnouncementItem } from "@/lib/adminDb";
import { announcements } from "@/data/announcements";
import { AnnouncementDetailActions } from "@/components/AnnouncementDetailActions";
import { NoticeLocalizedImages } from "@/components/NoticeLocalizedImages";
import { BinderPage, BinderHeading } from "@/components/concert/BinderPage";
import { PixelButton } from "@/components/concert/PixelButton";
import { FundingFormModal } from "@/components/concert/FundingFormModal";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const revalidate = 1800;

const ACCENT = "#ffd700";

export async function generateStaticParams() {
  const dbItems = await getPublishedNoticesForSite();
  const items = dbItems.length > 0 ? dbItems : announcements;
  return items.map((a) => ({ id: a.id }));
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("concert");

  const dbItem = await getNoticeByIdForSite(id);
  const item: AnnouncementItem | undefined =
    dbItem ?? (announcements.find((entry) => entry.id === id) as AnnouncementItem | undefined);

  if (!item) notFound();

  return (
    <BinderPage activeTab="notice" pixelFontFamily="'Mulmaru', 'PFStarDust', monospace" locale={locale}>
      <div className="pt-1 pb-6">
        <BinderHeading
          emoji="📋"
          title={
            locale === "en" ? (item.localizedTitles?.en ?? item.title) :
            locale === "zh" ? (item.localizedTitles?.zh ?? item.title) :
            locale === "ja" ? (item.localizedTitles?.ja ?? item.title) :
            item.title
          }
          subtitle={item.date}
          accentColor={ACCENT}
          showEmoji={false}
        />

        <Link
          href="/concert/notice"
          style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            fontSize: "0.55rem", letterSpacing: "0.2em",
            color: "rgba(255,215,0,0.7)", fontWeight: 700, marginBottom: "16px",
          }}
        >
          {t("backToList")}
        </Link>

        {item.localizedImages && item.localizedImages.length > 0 ? (
          <NoticeLocalizedImages
            itemId={item.id}
            sections={item.localizedImages}
            fallbackContent={item.content}
            dark
            locale={locale}
          />
        ) : null}

        {item.images && item.images.length > 0 ? (
          <div className="mt-4 space-y-3">
            {item.images.map((image, idx) => (
              <div key={`${item.id}-image-${idx}`} className="overflow-hidden" style={{ border: `1.5px solid ${ACCENT}44` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.alt} className="h-auto w-full object-contain" loading="lazy" />
              </div>
            ))}
          </div>
        ) : null}

        {(!item.localizedImages || item.localizedImages.length === 0) ? (
          <div className="space-y-2" style={{ fontSize: "0.72rem", lineHeight: 1.9, color: "rgba(255,255,255,0.9)" }}>
            {item.content.map((line, idx) => {
              if (typeof line === "string") {
                return line.trim().length === 0
                  ? <div key={`${item.id}-spacer-${idx}`} className="h-2" aria-hidden />
                  : <p key={`${item.id}-line-${idx}`}>{line}</p>;
              }
              return line.text.trim().length === 0
                ? <div key={`${item.id}-spacer-${idx}`} className="h-2" aria-hidden />
                : <p key={`${item.id}-line-${idx}`} style={{ fontWeight: line.emphasis ? 700 : 400, color: line.emphasis ? ACCENT : "rgba(255,255,255,0.9)" }}>{line.text}</p>;
            })}
          </div>
        ) : null}

        {item.actions && item.actions.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              {item.actions.map((action, idx) =>
                action.label === "TOSS" ? (
                  <PixelButton key={`${item.id}-action-${idx}`} label="TOSS" accentColor="#00c4db" shadowColor="#008899" textColor="#001a1f" href={action.href} isToss />
                ) : (
                  <PixelButton key={`${item.id}-action-${idx}`} label={action.label} accentColor="#ffd700" shadowColor="#a37f00" textColor="#1a1100" href={action.href} />
                )
              )}
            </div>
            <FundingFormModal />
          </div>
        ) : null}

        {item.ticketLinks ? (
          <div className="mt-4 flex justify-end">
            <PixelButton label={t("melonTicket")} accentColor="#00e5ff" shadowColor="#008899" textColor="#001a1f" href={item.ticketLinks.mobile} />
          </div>
        ) : null}

        <div className="mt-5" style={{ borderTop: `1px solid ${ACCENT}22`, paddingTop: "4px" }}>
          <AnnouncementDetailActions />
        </div>
      </div>
    </BinderPage>
  );
}
