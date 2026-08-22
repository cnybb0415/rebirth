import { MonitorPage } from "@/components/concert/MonitorPage";
import { announcements, getAnnouncementTitle } from "@/data/announcements";
import { NoticeImageTabs } from "@/components/concert/NoticeImageTabs";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

const ACCENT = "#ff9b3d";

export default async function ConcertNoticeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const item = announcements.find((a) => a.id === id);
  if (!item) notFound();

  const title = getAnnouncementTitle(item, locale);

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
