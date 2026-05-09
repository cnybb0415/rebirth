import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function SupportHelperPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("support");
  const tc = await getTranslations("common");
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/support"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          <span className="text-sm sm:text-xl" aria-hidden>‹</span>
          {t("back")}
        </Link>
        <h1 className="text-2xl font-bold">{t("helperTitle")}</h1>
        <p className="mt-2 text-sm text-foreground/70">{tc("loading")}</p>
      </main>
    </div>
  );
}
