import { MonitorPage, MonitorComingSoon } from "@/components/concert/MonitorPage";
import { setRequestLocale } from "next-intl/server";

export default async function ConcertChorusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <MonitorPage title="떼창곡" subtitle="SING-ALONG" accentColor="#00e5ff">
      <MonitorComingSoon accentColor="#00e5ff" />
    </MonitorPage>
  );
}
