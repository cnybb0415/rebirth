import { MonitorPage } from "@/components/concert/MonitorPage";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function ConcertHelperPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("concert");

  return (
    <MonitorPage title="헬퍼모집" subtitle="HELPER RECRUIT" accentColor="#b97fff">
      <p
        style={{
          fontSize: "clamp(5px, 1.5vw, 9px)",
          color: "rgba(255,255,255,0.75)",
          letterSpacing: "0.05em",
          lineHeight: 1.8,
          paddingTop: "4px",
          textAlign: "center",
        }}
      >
        {t("helperThanks")}
      </p>
    </MonitorPage>
  );
}
