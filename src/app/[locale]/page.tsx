import { siteConfig } from "@/config/site";
import { getChartsData } from "@/lib/charts";
import { YouTubeStatsCards } from "@/components/YouTubeStatsCards";
import { QuickActionsBar } from "@/components/QuickActionsBar";
import { ChartSummaryGrid } from "@/components/ChartSummaryGrid";
import { getLatestTweet } from "@/lib/x";
import { CrownHero } from "@/components/CrownHero";
import { HomeQuickView } from "@/components/HomeQuickView";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

export const revalidate = 900;

function SocialIcon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 bg-white">
      {children}
    </span>
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
  // 앨범 구매 버튼은 추후 발매 시 재노출 예정 (홈 화면에서만 숨김)
  const smsAction = siteConfig.actions.find((a): a is Extract<typeof siteConfig.actions[number], { kind: "smsVote" }> =>
    "kind" in a && (a as { kind: string }).kind === "smsVote"
  );
  const homeActions = [
    { label: t("actionKwangya"), href: "/kwangya119", kind: "kwangya" as const },
    { label: t("actionStreaming"), href: "#", kind: "streamingModal" as const },
    { label: t("actionRadio"), href: "/radio", kind: "radio" as const },
    { label: t("actionSmsVote"), href: "#", kind: "smsVote" as const, smsTo: smsAction?.smsTo, smsBody: smsAction?.smsBody },
    { label: t("actionGuide"), href: "/guide", kind: "guide" as const },
    { label: t("actionVote"), href: "/vote", kind: "vote" as const },
  ];

  return (
    <div className="min-h-screen text-foreground">
      <CrownHero />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pt-4 pb-10 sm:px-6 lg:gap-6">
        {/* 크라운 뮤비 조회수 */}
        <section className="rounded-2xl border border-foreground/10 bg-white px-4 py-3">
          <YouTubeStatsCards variant="inline" />
        </section>

        {/* 바로가기 */}
        <section className="rounded-2xl border border-foreground/10 bg-white p-3">
          <QuickActionsBar
            actions={homeActions}
            albumLinks={siteConfig.albumPurchaseLinks}
            oneClickStreamingLinks={siteConfig.oneClickStreamingLinks}
            containerVariant="none"
            gridClassName="grid-cols-2 gap-2 sm:grid-cols-3"
            buttonVariant="outline"
            buttonSize="lg"
            buttonClassName="h-12 rounded-xl text-[13px] leading-tight"
          />
        </section>

        <section id="home-quickview">
          <HomeQuickView />
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-white p-5">
          <ChartSummaryGrid trackTitle="EXO" charts={charts} moreHref="/charts" />
        </section>

        {/* 최신 게시물 */}
        {latestTweet ? (
          <section id="home-latest" className="rounded-2xl border border-foreground/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-semibold">{t("latestPost")}</div>
              <a href={latestTweet.url} target="_blank" rel="noopener noreferrer" className="text-xs text-foreground/55 hover:text-foreground">
                {t("viewPost")} ›
              </a>
            </div>
            <a href={latestTweet.url} target="_blank" rel="noopener noreferrer" className="mt-3 flex gap-3">
              {latestTweet.mediaUrl || latestTweet.previewImageUrl ? (
                <img
                  src={latestTweet.mediaUrl ?? latestTweet.previewImageUrl}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  loading="lazy"
                />
              ) : null}
              <div className="min-w-0">
                <p className="line-clamp-3 whitespace-pre-wrap text-sm text-foreground/85">{latestTweet.text}</p>
                <p className="mt-1.5 text-xs text-foreground/45">
                  @{latestTweet.username}
                  {latestTweet.createdAt
                    ? ` · ${new Date(latestTweet.createdAt).toLocaleDateString(locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : locale === "zh" ? "zh-CN" : "en-US", { timeZone: "Asia/Seoul" })}`
                    : ""}
                </p>
              </div>
            </a>
          </section>
        ) : null}

        <div className="flex items-center justify-center gap-4 pt-2">
          <a href={siteConfig.contacts.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-foreground/70 hover:text-foreground">
            <SocialIcon><InstagramIcon /></SocialIcon>
          </a>
          <a href={siteConfig.youtube.url} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-foreground/70 hover:text-foreground">
            <SocialIcon><YouTubeIcon /></SocialIcon>
          </a>
          <a href={siteConfig.contacts.twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="X" className="text-foreground/70 hover:text-foreground">
            <SocialIcon><XIcon /></SocialIcon>
          </a>
        </div>
      </main>

      <footer className="border-t border-foreground/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 py-9 text-center sm:px-6">
          <img
            src="/images/logo_width.webp"
            alt="EXO RE:BIRTH"
            className="h-auto w-56 object-contain invert mix-blend-screen"
          />
          <p className="text-xs font-semibold text-foreground/60">{t("copyright")}</p>
          <div className="space-y-0.5 text-[11px] text-foreground/40">
            <p><span className="font-medium text-foreground/55">MAIN</span> &nbsp;rebirth.exo@gmail.com</p>
            <p><span className="font-medium text-foreground/55">STRM</span> &nbsp;exo.strm@gmail.com</p>
            <p><span className="font-medium text-foreground/55">DEV</span> &nbsp;exo.dev0408@gmail.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
