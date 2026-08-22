import { MonitorPage } from "@/components/concert/MonitorPage";
import { announcements, getAnnouncementTitle } from "@/data/announcements";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import s from "@/components/concert/monitor-page.module.css";

const ACCENT = "#ff9b3d";

export default async function ConcertNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <MonitorPage title="공지" subtitle="NOTICE" accentColor={ACCENT} noPadding>
      <ul className={s.noticeList}>
        {announcements.map((item, i) => (
          <li key={item.id} className={s.noticeItem}>
            <Link href={`/concert/notice/${item.id}`} className={s.noticeLink}>
              <span className={s.noticeNum}>
                {String(announcements.length - i).padStart(2, "0")}
              </span>
              <span className={s.noticeTitle}>
                {getAnnouncementTitle(item, locale)}
              </span>
              <span className={s.noticeDate}>{item.date}</span>
              <span className={s.noticeArrow}>›</span>
            </Link>
          </li>
        ))}
        {Array.from({ length: Math.max(0, 6 - announcements.length) }).map((_, i) => (
          <li key={`empty-${i}`} className={s.noticeItem} style={{ pointerEvents: "none" }} />
        ))}
      </ul>
    </MonitorPage>
  );
}
