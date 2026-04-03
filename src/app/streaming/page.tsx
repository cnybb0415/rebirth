"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { streamingCategories } from "@/lib/streamingCategories";

export default function StreamingPage() {
  const [openAlbumModal, setOpenAlbumModal] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-bold">스트리밍</h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/charts" className="block">
            <Card className="transition hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="text-sm font-semibold">음원 순위</div>
                  <div className="mt-1 text-xs text-foreground/70"></div>
                </div>
                <span className="text-foreground/60" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </CardContent>
            </Card>
          </Link>
          {streamingCategories.map((category) => (
            <Link key={category.id} href={`/streaming/${category.id}`} className="block">
              <Card className="transition hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="text-sm font-semibold">{category.label}</div>
                    <div className="mt-1 text-xs text-foreground/70">{category.description}</div>
                  </div>
                  <span className="text-foreground/60" aria-hidden>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setOpenAlbumModal(true)}
            className="text-left"
          >
            <Card className="transition hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="text-sm font-semibold">앨범 구매</div>
                </div>
                <span className="text-foreground/60" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </CardContent>
            </Card>
          </button>
        </div>
      </main>

      {openAlbumModal ? (
        <div className="fixed inset-0 z-40">
          <button
            aria-label="닫기"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenAlbumModal(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="앨범 구매"
            className="relative mx-auto mt-24 w-[min(520px,calc(100%-2rem))] rounded-2xl border border-foreground/10 bg-background p-4 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-base font-semibold">앨범 구매</div>
              <Button size="sm" variant="ghost" onClick={() => setOpenAlbumModal(false)}>
                닫기
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {siteConfig.albumPurchaseLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="secondary" className="h-11 w-full">
                    {link.label}
                  </Button>
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
