import { Link } from "@/i18n/navigation";
import s from "./monitor-page.module.css";

interface MonitorPageProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  accentColor?: string;
}

export function MonitorPage({
  children,
  title,
  subtitle,
  accentColor = "#c4a8e8",
}: MonitorPageProps) {
  return (
    <>
      <div className={s.pageBg} aria-hidden />
      <div className={s.page}>
        <div className={s.monitorWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={s.monitorImg}
            src="/images/concert/encore/video_screen_transparent.png"
            alt=""
            aria-hidden
          />

          <div className={s.screen}>
            {/* Top bar: back button + title */}
            <div className={s.backRow}>
              <Link href="/concert/encore" className={s.backBtn}>
                ◄ MENU
              </Link>
              <span className={s.pageTitle}>{title}</span>
              {subtitle && (
                <span
                  className={s.headingSubtitle}
                  style={{ color: accentColor, flexShrink: 0 }}
                >
                  {subtitle}
                </span>
              )}
              <span
                className={s.accentDot}
                style={{ background: accentColor }}
              />
            </div>

            {/* Scrollable content */}
            <div className={s.screenContent}>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Compact heading for use inside monitor screen */
export function MonitorHeading({
  title,
  accentColor = "#c4a8e8",
}: {
  title: string;
  accentColor?: string;
}) {
  return (
    <div className={s.heading}>
      <h2
        className={s.headingTitle}
        style={{ color: accentColor, textShadow: `0 0 12px ${accentColor}66` }}
      >
        {title}
      </h2>
    </div>
  );
}

/** COMING SOON placeholder for pages not yet ready */
export function MonitorComingSoon({ accentColor = "#c4a8e8" }: { accentColor?: string }) {
  return (
    <div className={s.comingSoon}>
      <p className={s.comingSoonDots}>· · · · ·</p>
      <p className={s.comingSoonText} style={{ color: accentColor }}>
        COMING SOON
      </p>
    </div>
  );
}
