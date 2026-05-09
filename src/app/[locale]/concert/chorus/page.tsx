import { BinderPage, BinderHeading } from "@/components/concert/BinderPage";
import { ChorusTVScreen } from "@/components/concert/ChorusTVScreen";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function ConcertChorusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("concert");
  return (
    <BinderPage activeTab="chorus" pixelFontFamily="'Mulmaru', 'PFStarDust', monospace" locale={locale}>
      <BinderHeading
        emoji="🎵"
        title={t("chorusTitle")}
        subtitle="SING-ALONG"
        accentColor="#00e5ff"
      />
      <ChorusTVScreen initialLang={locale} />
    </BinderPage>
  );
}
