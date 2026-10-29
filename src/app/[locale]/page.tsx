import { siteConfig } from "@/config/site";
import { getChartsData } from "@/lib/charts";
import { YouTubeStatsCards } from "@/components/YouTubeStatsCards";
import { ChartSummaryGrid } from "@/components/ChartSummaryGrid";
import { getLatestTweet } from "@/lib/x";
import { HomeHero } from "@/components/HomeHero";
import { HomeQuickView } from "@/components/HomeQuickView";
import { HomeStreamingCard } from "@/components/HomeStreamingCard";
import { HomeQuickLinks } from "@/components/HomeQuickLinks";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

export const revalidate = 900;

const CARD = "rounded-3xl border border-foreground/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6";

function ChannelLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-12 items-center gap-3 rounded-2xl bg-neutral-50 px-3.5 text-sm font-semibold text-foreground/85 transition hover:bg-neutral-100"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-foreground/80">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span aria-hidden className="text-foreground/30">↗</span>
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M17.5 6.6h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.9C18.2 5 12 5 12 5s-6.2 0-7.8.3A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12c0 1.6.2 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.9C5.8 19 12 19 12 19s6.2 0 7.8-.3a2.6 2.6 0 0 0 1.8-1.9c.2-1.6.4-3.2.4-4.8s-.2-3.2-.4-4.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M10 15V9l5 3-5 3Z" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7 3h4.3l3.2 4.3L18.7 3H22l-5.6 7.1L22 21h-4.3l-3.7-5-3.9 5H2l6.6-8.3L3 3h4.3l3.5 4.7L14.3 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}


export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const charts = await getChartsData();
  const latestTweet = await getLatestTweet();
  const smsAction = siteConfig.actions.find((a): a is Extract<typeof siteConfig.actions[number], { kind: "smsVote" }> =>
    "kind" in a && (a as { kind: string }).kind === "smsVote"
  );
  const dateLocale = locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : locale === "zh" ? "zh-CN" : "en-US";

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-foreground">
      <HomeHero />
      <main className="mx-auto w-full max-w-6xl space-y-3 px-4 pb-12 pt-4 sm:space-y-4 sm:px-6 sm:pt-6">
        {/* 스밍 · 바로가기 / 스케줄 · 투표 */}
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          <div className="space-y-3 sm:space-y-4">
            <HomeStreamingCard links={siteConfig.oneClickStreamingLinks} />
            <div className="hidden lg:block">
              <HomeQuickLinks smsTo={smsAction?.smsTo} smsBody={smsAction?.smsBody} />
            </div>
          </div>
          <div id="home-quickview">
            <HomeQuickView />
          </div>
          <div className="lg:hidden">
            <HomeQuickLinks smsTo={smsAction?.smsTo} smsBody={smsAction?.smsBody} />
          </div>
        </div>

        {/* 음원 차트 */}
        <section className={CARD}>
          <ChartSummaryGrid trackTitle={siteConfig.trackTitle} charts={charts} moreHref="/charts" />
        </section>

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 lg:items-start">
          {/* 뮤직비디오 + 실제 조회수 */}
          <section id="home-video" className={CARD}>
            <h2 className="text-[17px] font-bold">{t("mvTitle")}</h2>
            <div className="mt-3 aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <iframe
                className="h-full w-full"
                src={siteConfig.youtube.embedUrl}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="mt-4">
              <YouTubeStatsCards variant="full" />
            </div>
          </section>

          {/* 최신 게시물 */}
          <section id="home-latest" className={CARD}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[17px] font-bold">{t("latestPost")}</h2>
                <p className="text-xs text-foreground/50">{t("latestPostSource")}</p>
              </div>
              <a
                href={siteConfig.contacts.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="-mr-1 flex min-h-11 shrink-0 items-center px-1 text-[13px] font-medium text-foreground/50 hover:text-foreground"
              >
                {t("goToX")} ›
              </a>
            </div>
            {latestTweet ? (
              <article className="mt-3">
                <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                  {latestTweet.previewUrl
                    ? latestTweet.text.replaceAll(latestTweet.previewUrl, "").replace(/\s*https:\/\/t\.co\/\S+\s*$/u, "").trim()
                    : latestTweet.text}
                </p>
                {latestTweet.mediaUrl || latestTweet.previewImageUrl ? (
                  <a
                    href={latestTweet.previewUrl ?? latestTweet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block overflow-hidden rounded-2xl bg-neutral-100"
                  >
                    <img
                      src={latestTweet.mediaUrl ?? latestTweet.previewImageUrl}
                      alt="X preview"
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                  </a>
                ) : null}
                <div className="mt-3 flex items-center justify-between text-xs text-foreground/45">
                  {latestTweet.createdAt ? (
                    <time dateTime={latestTweet.createdAt}>
                      {new Date(latestTweet.createdAt).toLocaleString(dateLocale, {
                        timeZone: "Asia/Seoul",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                  ) : (
                    <span />
                  )}
                  <a
                    href={latestTweet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center font-semibold text-foreground/70 hover:text-foreground"
                  >
                    {t("viewPost")} ↗
                  </a>
                </div>
              </article>
            ) : (
              <p className="mt-3 text-sm text-foreground/50">{t("noPost")}</p>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-foreground/[0.08] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <img src="/images/logo_width.webp" alt="EXO RE:BIRTH 로고" className="h-auto w-48 object-contain" />

          <h2 className="mt-6 text-xs font-bold text-foreground/50">{t("officialLinks")}</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:max-w-xl">
            <ChannelLink href={siteConfig.contacts.instagramUrl} label="Instagram" icon={<InstagramIcon />} />
            <ChannelLink href={siteConfig.youtube.url} label="YouTube" icon={<YouTubeIcon />} />
            <ChannelLink href={siteConfig.contacts.twitterUrl} label="X" icon={<XIcon />} />
            <ChannelLink
              href="https://kwangya119.smtown.com/"
              label={t("kwangyaSite")}
              icon={<img src="/images/icon/siren.png" alt="" className="h-[18px] w-[18px]" />}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <p className="text-xs font-semibold text-foreground/70">{t("copyright")}</p>
            <div className="space-y-0.5 text-[11px] text-foreground/45">
              <p><span className="font-medium text-foreground/60">MAIN</span> &nbsp;rebirth.exo@gmail.com</p>
              <p><span className="font-medium text-foreground/60">STRM</span> &nbsp;exo.strm@gmail.com</p>
              <p><span className="font-medium text-foreground/60">DEV</span> &nbsp;exo.dev0408@gmail.com</p>
            </div>
            <a
              href="https://x.com/EXO_REBIRTH"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X @EXO_REBIRTH"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 bg-white text-foreground/60 transition hover:bg-foreground/5 hover:text-foreground"
            >
              <XIcon />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
