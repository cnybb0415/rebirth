import { Link } from "@/i18n/navigation";
import { MonitorPage, MonitorComingSoon } from "@/components/concert/MonitorPage";
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
  await getTranslations("concert");

  return (
    <MonitorPage title="공지" subtitle="NOTICE" accentColor={ACCENT}>
      <MonitorComingSoon accentColor={ACCENT} />
    </MonitorPage>
  );
}
