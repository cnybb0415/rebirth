"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Radio, MessageSquare, Vote, BookOpen, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buildSmsHref, detectSmsPlatform } from "@/lib/sms";

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
    "flex min-h-[60px] w-full items-center gap-3.5 px-4 py-3 text-left transition hover:bg-neutral-50 active:bg-neutral-100";

  const inner = (it: (typeof items)[number]) => (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-foreground/80">
        {it.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-tight">{it.title}</span>
        <span className="mt-0.5 block truncate text-xs text-foreground/50">{it.desc}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-foreground/30" aria-hidden />
    </>
  );

  return (
    <section aria-labelledby="home-shortcuts-title">
      <h2 id="home-shortcuts-title" className="sr-only">
        {t("shortcuts")}
      </h2>
      <ul className="divide-y divide-foreground/[0.06] overflow-hidden rounded-3xl border border-foreground/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {items.map((it) => (
          <li key={it.key}>
            {it.href ? (
              <Link href={it.href} className={rowClass}>
                {inner(it)}
              </Link>
            ) : (
              <button type="button" onClick={it.onClick} className={rowClass}>
                {inner(it)}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
