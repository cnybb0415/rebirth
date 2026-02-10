import { siteConfig } from "@/config/site";
import { getChartsData } from "@/lib/charts";
import { YouTubeStatsCards } from "@/components/YouTubeStatsCards";
import { QuickActionsBar } from "@/components/QuickActionsBar";
import { ChartSummaryGrid } from "@/components/ChartSummaryGrid";
import { getLatestTweet } from "@/lib/x";
import { HomeHero } from "@/components/HomeHero";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

function SocialIcon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 bg-white shadow-sm">
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


export default async function Home() {
  const charts = await getChartsData();
  const latestTweet = await getLatestTweet();
  // 앨범 구매 버튼은 추후 발매 시 재노출 예정 (홈 화면에서만 숨김)
  const homeActions = [
    { label: "KWANGYA 119 신고하기", href: "/kwangya119" },
    ...siteConfig.actions.filter(
      (action) => action.label !== "REVERXE 앨범구매",
    ),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HomeHero />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Left: latest posts */}
          <div id="home-latest" className="rounded-2xl border border-foreground/10 bg-white p-5 shadow-sm">
            <div className="mx-auto w-full max-w-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold">최신 게시물</div>
                  <div className="text-sm text-foreground/60">X @weareoneEXO</div>
                </div>
                <a
                  href={siteConfig.contacts.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground/70 hover:text-foreground"
                >
                  X로 이동
                </a>
              </div>
              <div className="mt-4">
                {latestTweet ? (
                  <article className="rounded-xl border border-white/10 bg-neutral-900 p-3 text-white shadow-sm">
                    <div className="text-sm font-semibold text-white/90">@{latestTweet.username}</div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-white/90">
                      {latestTweet.text}
                    </p>
                    {latestTweet.mediaUrl || latestTweet.previewImageUrl ? (
                      <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
                        <img
                          src={latestTweet.mediaUrl ?? latestTweet.previewImageUrl}
                          alt="X preview"
                          className="aspect-square w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                    {latestTweet.previewUrl ? (
                      <a
                        href={latestTweet.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block text-xs text-sky-300 hover:text-sky-200"
                      >
                        {latestTweet.previewUrl}
                      </a>
                    ) : null}
                    <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                      {latestTweet.createdAt ? (
                        <span>{new Date(latestTweet.createdAt).toLocaleString("ko-KR")}</span>
                      ) : (
                        <span />
                      )}
                      <a
                        href={latestTweet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-white/80 hover:text-white"
                      >
                        게시물 보기
                      </a>
                    </div>
                  </article>
                ) : (
                  <div className="rounded-xl border border-foreground/10 bg-white p-4 text-sm text-foreground/60">
                    최신 게시물을 불러오지 못했습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="w-full max-w-md">
              <img
                src="/images/logo_width.png"
                alt="EXO RE:BIRTH 로고"
                className="mx-auto mt-2.5 mb-[25px] h-auto w-full max-w-md object-contain lg:mx-0"
              />
              <QuickActionsBar
                actions={homeActions}
                albumLinks={siteConfig.albumPurchaseLinks}
                oneClickStreamingLinks={siteConfig.oneClickStreamingLinks}
                containerVariant="none"
                gridClassName="grid-cols-2 gap-3"
                buttonVariant="outline"
                buttonSize="lg"
                buttonClassName="h-12 rounded-2xl text-xs leading-tight sm:text-sm"
              />
            </div>

            <div className="mt-7 w-full max-w-md">
              <div className="flex items-center justify-center gap-5">
                <a
                  href={siteConfig.contacts.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-foreground/80 hover:text-foreground"
                >
                  <SocialIcon>
                    <InstagramIcon />
                  </SocialIcon>
                </a>
                <a
                  href={siteConfig.youtube.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="text-foreground/80 hover:text-foreground"
                >
                  <SocialIcon>
                    <YouTubeIcon />
                  </SocialIcon>
                </a>
                <a
                  href={siteConfig.contacts.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className="text-foreground/80 hover:text-foreground"
                >
                  <SocialIcon>
                    <XIcon />
                  </SocialIcon>
                </a>
                <a
                  href="https://kwangya119.smtown.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="광야119 허위정보 신고"
                  className="text-foreground/80 hover:text-foreground"
                >
                  <SocialIcon>
                    <img src="/images/icon/siren.png" alt="" className="h-[18px] w-[18px]" />
                  </SocialIcon>
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 border-t border-foreground/10" />


        <section className="mt-2 rounded-2xl border border-foreground/10 bg-white p-6 shadow-sm">
          <ChartSummaryGrid trackTitle={siteConfig.trackTitle} charts={charts} />
        </section>

        <section id="home-video" className="mt-6 rounded-2xl border border-foreground/10 bg-white p-6 shadow-sm">
          <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-white shadow-sm">
            <div className="flex h-9 items-center gap-2 bg-[#ff4b4b] px-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/90" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-white/90" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-white/90" aria-hidden />
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                className="h-full w-full"
                src={siteConfig.youtube.embedUrl}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="px-4 pb-4">
              <YouTubeStatsCards variant="inline" />
            </div>
          </div>
        </section>


      </main>
    </div>
  );
}
