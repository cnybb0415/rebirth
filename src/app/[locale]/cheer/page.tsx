import { Link } from "@/i18n/navigation";
import { FanchantSongGrid } from "@/components/FanchantSongGrid";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function CheerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("concert");
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-6xl px-3 py-10 sm:px-6 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{t("cheerTitle")}</h1>
          </div>
          <Link
            href="/concert"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            <span className="text-sm sm:text-xl" aria-hidden>
              ‹
            </span>
            {t("concertList")}
          </Link>
        </div>

        <div className="mt-6">
          <FanchantSongGrid hrefBase="/concert/cheer" />
        </div>
      </main>
    </div>
  );
}
