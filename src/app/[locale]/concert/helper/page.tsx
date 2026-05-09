import { BinderPage, BinderHeading } from "@/components/concert/BinderPage";
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
    <BinderPage activeTab="helper" pixelFontFamily="'Mulmaru', 'PFStarDust', monospace" locale={locale}>
      <BinderHeading
        emoji="🛸"
        title={t("helperTitle")}
        subtitle="HELPER RECRUIT"
        accentColor="#b97fff"
      />
      <p
        style={{
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.75)",
          letterSpacing: "0.05em",
          lineHeight: 1.8,
          paddingTop: "8px",
          textAlign: "center",
        }}
      >
        {t("helperThanks")}
      </p>
    </BinderPage>
  );
}
