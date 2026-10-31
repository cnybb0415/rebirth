"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Radio, MessageSquare, Vote, BookOpen } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buildSmsHref, detectSmsPlatform } from "@/lib/sms";
import { HOME_CARD, SectionHead } from "@/components/home/SectionHead";

// 홈 바로가기 목록 (KWANGYA 119 · 라디오 · 문자투표 · 가이드 · 투표)
// 아이콘 + 제목 + 한 줄 설명. 문자투표는 누르면 문자 앱이 열림

export function HomeQuickLinks({ smsTo, smsBody }: { smsTo?: string; smsBody?: string }) {
  const t = useTranslations("home");

  const openSms = React.useCallback(() => {
    const href = buildSmsHref({ to: (smsTo ?? "0505").trim(), body: smsBody ?? "", platform: detectSmsPlatform() });
    window.location.href = href;
  }, [smsTo, smsBody]);

  const items: Array<{
    key: string;
    title: string;
    desc: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
  }> = [
    {
      key: "kwangya",
      title: "KWANGYA 119",
      desc: t("descKwangya"),
      icon: <img src="/images/icon/siren.png" alt="" className="h-[18px] w-[18px]" />,
      href: "/kwangya119",
    },
    { key: "radio", title: t("actionRadio"), desc: t("descRadio"), icon: <Radio size={18} />, href: "/radio" },
    { key: "sms", title: t("actionSmsVote"), desc: t("descSmsVote"), icon: <MessageSquare size={18} />, onClick: openSms },
    { key: "guide", title: t("actionGuide"), desc: t("descGuide"), icon: <BookOpen size={18} />, href: "/guide" },
    { key: "vote", title: t("actionVote"), desc: t("descVote"), icon: <Vote size={18} />, href: "/vote" },
  ];

  const rowClass =
    "group flex min-h-[64px] w-full items-center gap-4 border-t border-[#f0f0f1] py-3 first:border-t-0 text-left lg:min-h-[128px] lg:flex-col lg:items-start lg:justify-between lg:gap-4 lg:rounded-xl lg:border lg:border-[#e4e4e7] lg:p-4";

  return (
    <section aria-labelledby="home-shortcuts-title" className={HOME_CARD}>
      <SectionHead id="home-shortcuts-title" label={t("shortcuts")} />
      <ul className="mt-1 lg:grid lg:grid-cols-5 lg:gap-2">
        {items.map((it) => {
          const inner = (
            <>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f4f5] text-[#18181b]">
                {it.icon}
              </span>
              <span className="min-w-0 flex-1 lg:flex-none">
                <span className="block text-[15px] font-semibold leading-tight text-[#18181b]">{it.title}</span>
                <span className="mt-1 block text-xs leading-snug text-[#71717a]">{it.desc}</span>
              </span>
              <span aria-hidden className="shrink-0 text-lg text-[#18181b]/35 transition group-hover:translate-x-0.5 lg:hidden">
                →
              </span>
            </>
          );
          return (
            <li key={it.key}>
              {it.href ? (
                <Link href={it.href} className={rowClass}>
                  {inner}
                </Link>
              ) : (
                <button type="button" onClick={it.onClick} className={rowClass}>
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
