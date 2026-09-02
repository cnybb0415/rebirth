import { MonitorPage } from "@/components/concert/MonitorPage";
import { getNoticeByIdForSite, getPublishedNoticesForSite } from "@/lib/adminDb";
import { announcements, getAnnouncementTitle } from "@/data/announcements";
import { NoticeImageTabs } from "@/components/concert/NoticeImageTabs";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { AnnouncementItem } from "@/lib/adminDb";

export const revalidate = 1800;

const ACCENT = "#ff9b3d";

export async function generateStaticParams() {
  const dbItems = await getPublishedNoticesForSite();
  const items = dbItems.length > 0 ? dbItems : announcements;
  return items.map((a) => ({ id: a.id }));
}

export default async function ConcertNoticeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const dbItem = await getNoticeByIdForSite(id);
  const item: AnnouncementItem | undefined =
    dbItem ?? (announcements.find((a) => a.id === id) as AnnouncementItem | undefined);

  if (!item) notFound();

  const title =
    locale === "en" ? (item.localizedTitles?.en ?? item.title) :
    locale === "zh" ? (item.localizedTitles?.zh ?? item.title) :
    locale === "ja" ? (item.localizedTitles?.ja ?? item.title) :
    item.title;

  return (
    <MonitorPage
      title={title}
      subtitle="NOTICE"
      accentColor={ACCENT}
      backHref="/concert/notice"
      noPadding
    >
      <NoticeImageTabs item={item} accentColor={ACCENT} locale={locale} />
    </MonitorPage>
  );
}
