import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function SupportIdDonationPage({
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
          className="mb-3 inline-flex items-center gap-1 text-[13px] font-medium text-foreground/55 transition hover:text-foreground"
        >
          <span aria-hidden>‹</span>
          {t("back")}
        </Link>
        <h1 className="text-2xl font-bold">{t("idDonationTitle")}</h1>
        <div className="mt-6 overflow-hidden rounded-2xl border border-foreground/10 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/support/id-donation/아이디기부.png"
            alt={t("idDonationTitle")}
            className="h-auto w-full"
            loading="lazy"
          />
        </div>
      </main>
    </div>
  );
}
