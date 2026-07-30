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
      {/* 앵콜콘 확정 시 복구: <ChorusTVScreen initialLang={locale} /> */}
      <div style={{ padding: "48px 0", textAlign: "center" }}>
        <p style={{ fontSize: "0.42rem", letterSpacing: "0.45em", color: "rgba(255,255,255,0.2)", marginBottom: "14px" }}>· · · · ·</p>
        <p style={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.3em", color: "#00e5ff", textShadow: "0 0 16px #00e5ff66", marginBottom: "10px" }}>COMING SOON</p>
      </div>
    </BinderPage>
  );
}
