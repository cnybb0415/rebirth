import { getTranslations, setRequestLocale } from "next-intl/server";
import { HandCoins, HeartHandshake, KeyRound, Megaphone, Users } from "lucide-react";
import { MenuTiles } from "@/components/MenuTiles";

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  const supportItems = [
    { id: "team", label: t("supportTeam"), en: "TEAM", Icon: Users, href: "/support/team" },
    { id: "fund", label: t("supportFund"), en: "FUND", Icon: HandCoins, href: "/support/fund" },
    { id: "recruit", label: t("supportRecruit"), en: "RECRUIT", Icon: Megaphone, href: "/support/recruit" },
    { id: "id-donation", label: t("idDonation"), en: "ID DONATION", Icon: KeyRound, href: "/support/id-donation" },
    { id: "helper", label: t("supportHelper"), en: "HELPER", Icon: HeartHandshake, href: "/support/helper" },
  ];

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-bold">{t("support")}</h1>

        <MenuTiles items={supportItems} />
      </main>
    </div>
  );
}
