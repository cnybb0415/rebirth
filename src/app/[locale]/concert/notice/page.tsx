import { MonitorPage } from "@/components/concert/MonitorPage";
import { getPublishedNoticesForSite } from "@/lib/adminDb";
import { announcements, getAnnouncementTitle } from "@/data/announcements";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import s from "@/components/concert/monitor-page.module.css";

export const revalidate = 1800;

const ACCENT = "#ff9b3d";

export default async function ConcertNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const dbItems = await getPublishedNoticesForSite();
  const items = dbItems.length > 0 ? dbItems : announcements;

  function getTitle(item: (typeof items)[number]) {
    if ("localizedTitles" in item) {
      if (locale === "en") return item.localizedTitles?.en ?? item.title;
      if (locale === "zh") return item.localizedTitles?.zh ?? item.title;
      if (locale === "ja") return item.localizedTitles?.ja ?? item.title;
    }
    return getAnnouncementTitle(item as (typeof announcements)[number], locale);
  }

  return (
    <MonitorPage title="공지" subtitle="NOTICE" accentColor={ACCENT} noPadding>
      <ul className={s.noticeList}>
        {items.map((item, i) => (
          <li key={item.id} className={s.noticeItem}>
            <Link href={`/concert/notice/${item.id}`} className={s.noticeLink}>
              <span className={s.noticeNum}>
                {String(items.length - i).padStart(2, "0")}
              </span>
              <span className={s.noticeTitle}>{getTitle(item)}</span>
              <span className={s.noticeDate}>{item.date}</span>
              <span className={s.noticeArrow}>›</span>
            </Link>
          </li>
        ))}
        {Array.from({ length: Math.max(0, 6 - items.length) }).map((_, i) => (
          <li key={`empty-${i}`} className={s.noticeItem} style={{ pointerEvents: "none" }} />
        ))}
      </ul>
    </MonitorPage>
  );
}
