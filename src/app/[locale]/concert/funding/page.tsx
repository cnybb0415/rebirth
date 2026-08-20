import { MonitorPage, MonitorComingSoon } from "@/components/concert/MonitorPage";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 3600;

const ACCENT = "#ffd700";

export default async function ConcertFundingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <MonitorPage title="모금" subtitle="FUNDING" accentColor={ACCENT}>
      <MonitorComingSoon accentColor={ACCENT} />
    </MonitorPage>
  );
}
