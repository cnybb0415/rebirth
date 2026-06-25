import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { guideCategories, GuideCategoryId } from "@/lib/guideCategories";

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

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {guideCategories.map((category) => (
          <Link key={category.id} href={`/guide/${category.id}`} className="block">
            <Card className="transition hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="text-sm font-semibold">{catLabels[category.id]}</div>
                  <div className="mt-1 text-xs text-foreground/70">{category.description}</div>
                </div>
                <span className="text-foreground/60" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
