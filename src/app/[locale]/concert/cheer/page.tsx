import { MonitorPage } from "@/components/concert/MonitorPage";
import { CheerSelectClient } from "./CheerSelectClient";
import { getCheeringSongs } from "@/lib/cheering";
import { getTranslations, setRequestLocale } from "next-intl/server";

const ACCENT = "#ff4d8d";

export default async function ConcertCheerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [songs, t] = await Promise.all([getCheeringSongs(), getTranslations("concert")]);

  return (
    <MonitorPage title="응원법" subtitle="CHEER" accentColor={ACCENT}>
      <CheerSelectClient songs={songs} preparingLabel={t("preparing")} />
    </MonitorPage>
  );
}
