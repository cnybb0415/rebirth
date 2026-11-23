import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clapperboard, Download, Gift, Headphones, UserPlus, Vote } from "lucide-react";
import { MenuTiles } from "@/components/MenuTiles";
import { guideCategories, GuideCategoryId } from "@/lib/guideCategories";

const GUIDE_META: Record<GuideCategoryId, { en: string; Icon: typeof Headphones }> = {
  streaming: { en: "STREAMING", Icon: Headphones },
  download: { en: "DOWNLOAD", Icon: Download },
  signup: { en: "SIGN UP", Icon: UserPlus },
  gift: { en: "GIFT", Icon: Gift },
  mv: { en: "M/V", Icon: Clapperboard },
  prevote: { en: "VOTE", Icon: Vote },
};

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guide");

  const catLabels: Record<GuideCategoryId, string> = {
    streaming: t("cat.streaming"),
    download: t("cat.download"),
    signup: t("cat.signup"),
    gift: t("cat.gift"),
    mv: t("cat.mv"),
    prevote: t("cat.prevote"),
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <MenuTiles
        items={guideCategories.map((c) => ({
          id: c.id,
          label: catLabels[c.id],
          en: GUIDE_META[c.id].en,
          Icon: GUIDE_META[c.id].Icon,
          href: `/guide/${c.id}`,
        }))}
      />
    </main>
  );
}
