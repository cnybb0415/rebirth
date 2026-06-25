import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  const ts = await getTranslations("support");

  const supportItems = [
    { id: "team", label: t("supportTeam"), href: "/support/team" as const },
    { id: "fund", label: t("supportFund"), href: "/support/fund" as const },
    { id: "recruit", label: t("supportRecruit"), href: "/support/recruit" as const },
    { id: "id-donation", label: t("idDonation"), href: "/support/id-donation" as const },
    { id: "helper", label: t("supportHelper"), href: "/support/helper" as const },
  ];

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-bold">{t("support")}</h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {supportItems.map((item) => (
            <Link key={item.id} href={item.href} className="block">
              <Card className="transition hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="text-sm font-semibold">{item.label}</div>
                  <span className="text-foreground/40">→</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
