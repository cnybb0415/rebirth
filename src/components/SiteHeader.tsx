"use client";

import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import logoPng from "@/../public/images/exo_logo.png";
import { guideCategories } from "@/lib/guideCategories";
import { streamingCategories } from "@/lib/streamingCategories";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function SiteHeader() {
  const t = useTranslations("nav");
  const tguide = useTranslations("guide");
  const tstreaming = useTranslations("streaming");

  const guideCatLabels: Record<string, string> = {
    streaming: tguide("cat.streaming"),
    download: tguide("cat.download"),
    signup: tguide("cat.signup"),
    gift: tguide("cat.gift"),
    mv: tguide("cat.mv"),
    prevote: tguide("cat.prevote"),
  };

  const streamingCatLabels: Record<string, string> = {
    recommended: tstreaming("cat.recommended"),
    oneclick: tstreaming("cat.oneclick"),
    links: tstreaming("cat.links"),
  };
  const [openMenu, setOpenMenu] = useState(false);
  const [openGuide, setOpenGuide] = useState(false);
  const [openStreaming, setOpenStreaming] = useState(false);
  const [openConcert, setOpenConcert] = useState(false);
  const [openSupport, setOpenSupport] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpenMenu(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-slate-100">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:max-w-none">
        <Link href="/" className="flex items-center gap-2">
          <Image src={logoPng} alt="EXO RE:BIRTH" width={20} height={20} className="h-5 w-5" priority />
          <span className="relative top-[-1px] text-sm font-semibold tracking-wide text-foreground/80">EXO RE:BIRTH</span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            type="button"
            aria-label={t("openMenu")}
            className="inline-flex h-9 w-9 items-center justify-center text-foreground/70 transition hover:text-foreground"
            onClick={() => setOpenMenu((prev) => !prev)}
          >
            {openMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {openMenu ? (
        <div className="fixed inset-0 z-40">
          <button
            aria-label={t("closeMenu")}
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenMenu(false)}
          />
          <aside className="relative ml-auto flex h-full w-[78%] max-w-xs flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
              <span className="text-sm font-semibold text-foreground/80" />
              <button
                type="button"
                aria-label={t("close")}
                className="inline-flex h-9 w-9 items-center justify-center text-foreground/70"
                onClick={() => setOpenMenu(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-3">
              <div className="grid gap-2 text-sm font-medium text-foreground/80">
                <Link href="/" className="rounded-lg px-2 py-2 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                  {t("home")}
                </Link>
                <div>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 hover:bg-foreground/5"
                    onClick={() => setOpenGuide((prev) => !prev)}
                  >
                    <span>{t("guide")}</span>
                    <ChevronDown className={`h-4 w-4 transition ${openGuide ? "rotate-180" : ""}`} />
                  </button>
                  {openGuide ? (
                    <div className="mt-1 space-y-1 pl-3 text-sm text-foreground/70">
                      {guideCategories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/guide/${category.id}`}
                          className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5"
                          onClick={() => setOpenMenu(false)}
                        >
                          {guideCatLabels[category.id] ?? category.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 hover:bg-foreground/5"
                    onClick={() => setOpenStreaming((prev) => !prev)}
                  >
                    <span>{t("streaming")}</span>
                    <ChevronDown className={`h-4 w-4 transition ${openStreaming ? "rotate-180" : ""}`} />
                  </button>
                  {openStreaming ? (
                    <div className="mt-1 space-y-1 pl-3 text-sm text-foreground/70">
                      {streamingCategories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/streaming/${category.id}`}
                          className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5"
                          onClick={() => setOpenMenu(false)}
                        >
                          {streamingCatLabels[category.id] ?? category.label}
                        </Link>
                      ))}
                      <Link
                        href="/charts"
                        className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5"
                        onClick={() => setOpenMenu(false)}
                      >
                        {t("charts")}
                      </Link>
                    </div>
                  ) : null}
                </div>
                <Link href="/vote" className="rounded-lg px-2 py-2 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                  {t("vote")}
                </Link>
                <Link href="/schedule" className="rounded-lg px-2 py-2 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                  {t("schedule")}
                </Link>
                <Link href="/radio" className="rounded-lg px-2 py-2 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                  {t("radio")}
                </Link>
                <Link href="/kwangya119" className="rounded-lg px-2 py-2 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                  {t("kwangya119")}
                </Link>
                <div>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 hover:bg-foreground/5"
                    onClick={() => setOpenConcert((prev) => !prev)}
                  >
                    <span>{t("concert")}</span>
                    <ChevronDown className={`h-4 w-4 transition ${openConcert ? "rotate-180" : ""}`} />
                  </button>
                  {openConcert ? (
                    <div className="mt-1 space-y-1 pl-3 text-sm text-foreground/70">
                      <Link href="/concert" className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                        {t("concertHome")}
                      </Link>
                      <Link href="/concert/chorus" className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                        {t("chorus")}
                      </Link>
                      <Link href="/concert/cheer" className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                        {t("cheer")}
                      </Link>
                      <Link href="/concert/helper" className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                        {t("helper")}
                      </Link>
                      <Link href="/concert/funding" className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                        {t("funding")}
                      </Link>
                      <Link href="/concert/notice" className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                        {t("notice")}
                      </Link>
                    </div>
                  ) : null}
                </div>
                <div>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 hover:bg-foreground/5"
                    onClick={() => setOpenSupport((prev) => !prev)}
                  >
                    <span>{t("support")}</span>
                    <ChevronDown className={`h-4 w-4 transition ${openSupport ? "rotate-180" : ""}`} />
                  </button>
                  {openSupport ? (
                    <div className="mt-1 space-y-1 pl-3 text-sm text-foreground/70">
                      <Link href="/support/team" className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                        {t("supportTeam")}
                      </Link>
                      <Link href="/support/fund" className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                        {t("supportFund")}
                      </Link>
                      <Link href="/support/id-donation" className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                        {t("idDonation")}
                      </Link>
                      <Link href="/support/helper" className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                        {t("supportHelper")}
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            </nav>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
