import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function SupportRecruitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("support");

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
        <h1 className="text-2xl font-bold">{t("recruitTitle")}</h1>

        <div className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/support/recruit/모집공고.png"
              alt={t("recruitImgAlt")}
              className="h-auto w-full"
              loading="lazy"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <a
            href="https://forms.gle/beUZkTDBrdEf2MMd6"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-foreground/15 bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:border-foreground/35 hover:shadow-md"
          >
            {t("recruitFormBtn")}
          </a>
        </div>
      </main>
    </div>
  );
}
