"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import s from "./encore.module.css";

const MENU_ITEMS = [
  { id: "cheer",   navKey: "cheer",   en: "CHEER",   href: "/concert/cheer"   },
  { id: "funding", navKey: "funding", en: "FUNDING", href: "/concert/funding" },
  { id: "notice",  navKey: "notice",  en: "NOTICE",  href: "/concert/notice"  },
  { id: "chorus",  navKey: "chorus",  en: "CHORUS",  href: "/concert/chorus"  },
  { id: "helper",  navKey: "helper",  en: "HELPER",  href: "/concert/helper"  },
] as const;

export default function EncorePage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const router = useRouter();
  const locale = useLocale();
  const tnav = useTranslations("nav");

  const navigate = (href: string) => router.push(`/${locale}${href}`);

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

          <div className={s.screen} role="navigation" aria-label="콘서트 메뉴">
            <div className={s.screenInner}>

              {/* ── HUD 상단 ── */}
              <div className={s.hud}>
                <span className={s.hudHp}>♥ ♥ ♥ ♥ ♥ ♥</span>
                <span className={s.hudCenter}>EXO-L</span>
                <span className={s.hudScore}>★ 120408</span>
              </div>

              {/* ── 타이틀 ── */}
              <div className={s.titleBlock}>
                <p className={s.screenTitle}>EXO PLANET #6</p>
                <p className={s.screenSubtitle}>— EXhOrizon dot —</p>
              </div>

              {/* ── 픽셀 구분선 ── */}
              <div className={s.pixelDivider}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <span key={i} className={s.pixelDot} />
                ))}
              </div>

              {/* ── 메뉴 ── */}
              <ul className={s.menuList}>
                {MENU_ITEMS.map((item, i) => {
                  const isActive = i === activeIdx;
                  return (
                    <li
                      key={item.id}
                      className={`${s.menuItem} ${isActive ? s.menuItemActive : ""}`}
                      tabIndex={0}
                      role="link"
                      aria-current={isActive ? "page" : undefined}
                      onMouseEnter={() => setActiveIdx(i)}
                      onFocus={() => setActiveIdx(i)}
                      onClick={() => navigate(item.href)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(item.href); }
                        if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i + 1) % MENU_ITEMS.length); }
                        if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i - 1 + MENU_ITEMS.length) % MENU_ITEMS.length); }
                      }}
                    >
                      <span className={s.menuCursor} aria-hidden>►</span>
                      <span className={s.menuKo}>{tnav(item.navKey)}</span>
                      <span className={s.menuEn}>{item.en}</span>
                    </li>
                  );
                })}
              </ul>

              {/* ── INSERT COIN ── */}
              <p className={s.insertCoin} aria-hidden>— INSERT COIN —</p>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
