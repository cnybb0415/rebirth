import { getPublishedNoticesForSite } from "@/lib/adminDb";
import { announcements } from "@/data/announcements";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const revalidate = 1800;

export default async function ConcertAnnouncementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("concert");

  const dbItems = await getPublishedNoticesForSite();
  const items = dbItems.length > 0 ? dbItems : announcements;

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{t("noticeTitle")}</h1>
          <p className="mt-2 text-sm text-foreground/70">{t("announcementsDesc")}</p>
        </div>

        <section className="mt-6 rounded-2xl border border-foreground/10 bg-white p-5 shadow-sm">
          <ul className="divide-y divide-foreground/10">
            {items.map((item) => (
              <li key={item.id} className="py-4">
                <Link href={`/notice/${item.id}`} className="block">
                  <div className="text-sm font-semibold text-foreground">
                    {locale === "en" ? (item.localizedTitles?.en ?? item.title) :
                     locale === "zh" ? (item.localizedTitles?.zh ?? item.title) :
                     locale === "ja" ? (item.localizedTitles?.ja ?? item.title) :
                     item.title}
                  </div>
                  <div className="mt-1 text-xs text-foreground/60">{item.date}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
