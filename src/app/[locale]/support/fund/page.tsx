import { getTranslations, setRequestLocale } from "next-intl/server";
import { TossActionButton } from "@/components/AnnouncementDetailActions";
import { Link } from "@/i18n/navigation";

const LOCALE_IMAGE: Record<string, string> = {
  ko: "/images/support/fund/모금공지.png",
  en: "/images/support/fund/모금공지_en.png",
  zh: "/images/support/fund/모금공지_zh.png",
  ja: "/images/support/fund/모금공지_ja.png",
};

export default async function SupportFundPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("support");
  const imgSrc = LOCALE_IMAGE[locale] ?? LOCALE_IMAGE.ko;

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
        <h1 className="text-2xl font-bold">{t("fundTitle")}</h1>

        <div className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={t("fundImgAlt")}
              className="h-auto w-full"
              loading="lazy"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <TossActionButton href="supertoss://send?bank=토스뱅크&accountNo=100159180057" label="TOSS" />
            <a
              href="https://paypal.me/EXOREBIRTH"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/90"
            >
              PAYPAL
            </a>
          </div>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSd1nF68HSKuxfRThMP0uBNx3ZVwUtlIfdq4lByRR2SVuTnTHg/viewform"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-foreground/15 bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:border-foreground/35 hover:shadow-md"
          >
            {t("depositForm")}
          </a>
        </div>
      </main>
    </div>
  );
}
