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
import { HOME_CARD, PILL, SectionHead } from "@/components/home/SectionHead";

export const revalidate = 900;


function ChannelLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-11 items-center gap-3 border-t border-[#f0f0f1] text-sm font-medium text-[#18181b] hover:underline"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#52525b]">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
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
    <div className="min-h-screen bg-[#f6f6f7] text-[#18181b]">
      <HomeHero />
      <main className="mx-auto w-full max-w-6xl space-y-3 px-3 pb-12 pt-3 sm:space-y-4 sm:px-5 sm:pt-4">
        <HomeStreamingCard links={siteConfig.oneClickStreamingLinks} />

        <div id="home-quickview" style={{ scrollMarginTop: 72 }}>
          <HomeQuickView />
        </div>

        <HomeQuickLinks smsTo={smsAction?.smsTo} smsBody={smsAction?.smsBody} />

        <section className={HOME_CARD}>
          <ChartSummaryGrid trackTitle={siteConfig.trackTitle} charts={charts} moreHref="/charts" />
        </section>

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 lg:items-start">
          {/* 뮤직비디오 + 실제 조회수 */}
          <section id="home-video" className={HOME_CARD}>
            <SectionHead label={t("mvTitle")} />
            <div className="mt-2 aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                className="h-full w-full"
                src={siteConfig.youtube.embedUrl}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="mt-5">
              <YouTubeStatsCards variant="full" />
            </div>
          </section>

          {/* 최신 게시물 */}
          <section id="home-latest" className={HOME_CARD}>
            <SectionHead
              label={t("latestPost")}
              right={
                <a href={siteConfig.contacts.twitterUrl} target="_blank" rel="noopener noreferrer" className={PILL}>
                  {t("goToX")}›
                </a>
              }
            />
            {latestTweet ? (
              <article className="mt-2">
                <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                  {(latestTweet.previewUrl ? latestTweet.text.replaceAll(latestTweet.previewUrl, "") : latestTweet.text)
                    .replace(/\s*https:\/\/t\.co\/\S+\s*$/u, "")
                    .replace(/\n{2,}/g, "\n")
                    .trim()}
                </p>
                {latestTweet.mediaUrl || latestTweet.previewImageUrl ? (
                  <a
                    href={latestTweet.previewUrl ?? latestTweet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block overflow-hidden rounded-xl bg-[#f4f4f5]"
                  >
                    <img
                      src={latestTweet.mediaUrl ?? latestTweet.previewImageUrl}
                      alt="X preview"
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                  </a>
                ) : null}
                <div className="mt-2 flex items-center justify-between text-xs text-[#71717a]">
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
                    className="flex min-h-11 items-center font-semibold text-[#18181b] hover:underline"
                  >
                    {t("viewPost")} ↗
                  </a>
                </div>
              </article>
            ) : (
              <p className="mt-2 text-sm text-[#71717a]">{t("noPost")}</p>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-[#e4e4e7] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <img src="/images/logo_width.webp" alt="EXO RE:BIRTH 로고" className="h-auto w-40 object-contain" />

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-xs font-semibold text-[#71717a]">{t("officialLinks")}</h2>
              <div className="mt-2">
                <ChannelLink href={siteConfig.contacts.instagramUrl} label="Instagram" icon={<InstagramIcon />} />
                <ChannelLink href={siteConfig.youtube.url} label="YouTube" icon={<YouTubeIcon />} />
                <ChannelLink href={siteConfig.contacts.twitterUrl} label="X" icon={<XIcon />} />
                <ChannelLink
                  href="https://kwangya119.smtown.com/"
                  label={t("kwangyaSite")}
                  icon={<img src="/images/icon/siren.png" alt="" className="h-[18px] w-[18px]" />}
                />
              </div>
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#71717a]">Contact</h2>
              <dl className="mt-2 text-sm">
                <div className="flex min-h-11 items-center gap-4 border-t border-[#f0f0f1]"><dt className="w-12 text-xs font-medium text-[#71717a]">MAIN</dt><dd>rebirth.exo@gmail.com</dd></div>
                <div className="flex min-h-11 items-center gap-4 border-t border-[#f0f0f1]"><dt className="w-12 text-xs font-medium text-[#71717a]">STRM</dt><dd>exo.strm@gmail.com</dd></div>
                <div className="flex min-h-11 items-center gap-4 border-t border-[#f0f0f1]"><dt className="w-12 text-xs font-medium text-[#71717a]">DEV</dt><dd>exo.dev0408@gmail.com</dd></div>
                <div className="flex min-h-11 items-center gap-4 border-t border-[#f0f0f1]">
                  <dt className="w-12 text-xs font-medium text-[#71717a]">X</dt>
                  <dd><a href="https://x.com/EXO_REBIRTH" target="_blank" rel="noopener noreferrer" className="hover:underline">@EXO_REBIRTH</a></dd>
                </div>
              </dl>
            </div>
          </div>

          <p className="mt-8 text-xs text-[#a1a1aa]">{t("copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
