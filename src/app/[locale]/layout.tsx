import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { ShellWrapper } from "@/components/ShellWrapper";
import { SetHtmlLang } from "@/components/SetHtmlLang";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: siteConfig.title,
  description: "원클릭 링크, 바로가기, 차트 현황을 한 화면에.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  const wallpaperSrc = siteConfig.assets.wallpaper.src?.trim();
  const overlayOpacity = siteConfig.assets.wallpaper.overlayOpacity;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SetHtmlLang locale={locale} />
      {wallpaperSrc ? (
        <>
          <div
            aria-hidden
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${wallpaperSrc})` }}
          />
          <div
            aria-hidden
            className="fixed inset-0 z-0 bg-background"
            style={{
              opacity: typeof overlayOpacity === "number" ? overlayOpacity : 0.9,
            }}
          />
        </>
      ) : null}
      <div
        className={
          wallpaperSrc
            ? "relative z-10 min-h-screen bg-transparent"
            : "min-h-screen bg-transparent"
        }
      >
        <ShellWrapper>{children}</ShellWrapper>
      </div>
    </NextIntlClientProvider>
  );
}
