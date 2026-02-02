"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import logoPng from "@/../public/images/exo_logo.png";
import { guideCategories } from "@/lib/guideCategories";
import { streamingCategories } from "@/lib/streamingCategories";
import { prevoteCategories } from "@/lib/prevoteCategories";

export function SiteHeader() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openGuide, setOpenGuide] = useState(false);
  const [openStreaming, setOpenStreaming] = useState(false);
  const [openPrevote, setOpenPrevote] = useState(false);
  const [openConcert, setOpenConcert] = useState(false);
  const [openSupport, setOpenSupport] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-slate-100">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:max-w-none">
        <Link href="/" className="flex items-center gap-2">
          <Image src={logoPng} alt="EXO RE:BIRTH" width={20} height={20} className="h-5 w-5" priority />
          <span className="relative top-[-1px] text-sm font-semibold tracking-wide text-foreground/80">EXO RE:BIRTH</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="메뉴 열기"
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
            aria-label="메뉴 닫기"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenMenu(false)}
          />
          <aside className="relative ml-auto h-full w-[78%] max-w-xs bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
              <span className="text-sm font-semibold text-foreground/80" />
              <button
                type="button"
                aria-label="닫기"
                className="inline-flex h-9 w-9 items-center justify-center text-foreground/70"
                onClick={() => setOpenMenu(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="px-4 py-3">
              <div className="grid gap-2 text-sm font-medium text-foreground/80">
                <Link href="/" className="rounded-lg px-2 py-2 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                  홈
                </Link>
                <div>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 hover:bg-foreground/5"
                    onClick={() => setOpenGuide((prev) => !prev)}
                  >
                    <span>가이드</span>
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
                          {category.label}
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
                    <span>스트리밍</span>
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
                          {category.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 hover:bg-foreground/5"
                    onClick={() => setOpenPrevote((prev) => !prev)}
                  >
                    <span>사전투표</span>
                    <ChevronDown className={`h-4 w-4 transition ${openPrevote ? "rotate-180" : ""}`} />
                  </button>
                  {openPrevote ? (
                    <div className="mt-1 space-y-1 pl-3 text-sm text-foreground/70">
                      {prevoteCategories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/prevote/${category.id}`}
                          className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5"
                          onClick={() => setOpenMenu(false)}
                        >
                          {category.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
                <Link href="/schedule" className="rounded-lg px-2 py-2 hover:bg-foreground/5" onClick={() => setOpenMenu(false)}>
                  스케줄
                </Link>
                <div>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 hover:bg-foreground/5"
                    onClick={() => setOpenConcert((prev) => !prev)}
                  >
                    <span>콘서트</span>
                    <ChevronDown className={`h-4 w-4 transition ${openConcert ? "rotate-180" : ""}`} />
                  </button>
                  {openConcert ? (
                    <div className="mt-1 space-y-1 pl-3 text-sm text-foreground/70">
                      <Link
                        href="/cheer"
                        className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5"
                        onClick={() => setOpenMenu(false)}
                      >
                        응원법
                      </Link>
                      <Link
                        href="/notice"
                        className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5"
                        onClick={() => setOpenMenu(false)}
                      >
                        공지사항
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
                    <span>서포트</span>
                    <ChevronDown className={`h-4 w-4 transition ${openSupport ? "rotate-180" : ""}`} />
                  </button>
                  {openSupport ? (
                    <div className="mt-1 space-y-1 pl-3 text-sm text-foreground/70">
                      <Link
                        href="/support/team"
                        className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5"
                        onClick={() => setOpenMenu(false)}
                      >
                        팀 소개
                      </Link>
                      <Link
                        href="/support/fund"
                        className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5"
                        onClick={() => setOpenMenu(false)}
                      >
                        모금 공지
                      </Link>
                      <Link
                        href="/support/id-donation"
                        className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5"
                        onClick={() => setOpenMenu(false)}
                      >
                        아이디 기부
                      </Link>
                      <Link
                        href="/support/helper"
                        className="block rounded-lg px-2 py-1.5 hover:bg-foreground/5"
                        onClick={() => setOpenMenu(false)}
                      >
                        헬퍼 지원
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
