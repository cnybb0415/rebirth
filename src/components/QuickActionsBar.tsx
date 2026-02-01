
"use client";
import { Zap, ShoppingBag, Radio, MessageSquare, Megaphone, Vote } from "lucide-react";

function IconBookClosed({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 19.5c0-1.9 1.6-3.5 3.5-3.5H20" />
      <path d="M4 4.5C4 3.1 5.1 2 6.5 2H20v20H7.5C5.6 22 4 20.4 4 18.5v-14z" />
      <path d="M8 6h8" />
      <path d="M8 9h8" />
    </svg>
  );
}
function IconMusic({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="relative top-[2px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
      <path d="M19 16a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
      <path d="M11.5 13V5l10-2v8" />
      <path d="M11.5 7l10-2" />
    </svg>
  );
}

const actionIcons: Record<string, React.ReactNode> = {
  "원클릭 스트리밍": <IconMusic />,
  "KWANGYA 119 신고하기": (
    <img src="/images/icon/siren.png" alt="" className="h-4 w-4" />
  ),
  "REVERXE 앨범구매": <ShoppingBag size={18} />,
  "앨범 구매": <ShoppingBag size={18} />,
  "라디오 신청하기": <Radio size={18} />,
  "생방송 문자투표": <MessageSquare size={18} />,
  "가이드": <IconBookClosed />,
  "응원법": <Megaphone size={18} />,
  "음악방송 사전투표": <Vote size={18} />,
};

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OneClickStreamingGrid, type OneClickStreamingLink } from "@/components/OneClickStreamingGrid";
import { buildSmsHref, detectSmsPlatform } from "@/lib/sms";

export type QuickAction = {
  label: string;
  href: string;
  kind?: "streamingModal" | "albumModal" | "smsVote";
  smsTo?: string;
  smsBody?: string;
};

export type QuickLink = {
  label: string;
  href: string;
};

type ModalType = "streaming" | "album";

export function QuickActionsBar({
  actions,
  albumLinks,
  oneClickStreamingLinks,
  containerVariant = "card",
  containerClassName,
  gridClassName,
  buttonVariant = "outline",
  buttonSize,
  buttonClassName,
}: {
  actions: ReadonlyArray<QuickAction>;
  albumLinks?: ReadonlyArray<QuickLink>;
  oneClickStreamingLinks?: ReadonlyArray<OneClickStreamingLink>;
  containerVariant?: "card" | "none";
  containerClassName?: string;
  gridClassName?: string;
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  buttonSize?: React.ComponentProps<typeof Button>["size"];
  buttonClassName?: string;
}) {
  const [openModal, setOpenModal] = React.useState<ModalType | null>(null);

  const openSmsVote = React.useCallback((action: QuickAction) => {
    const smsTo = (action.smsTo ?? "0505").trim();
    const bodyText = action.smsBody ?? "";
    const platform = detectSmsPlatform();
    const href = buildSmsHref({ to: smsTo, body: bodyText, platform });
    window.location.href = href;
  }, []);

  React.useLayoutEffect(() => {
    if (!openModal) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenModal(null);
    };

    document.addEventListener("keydown", onKeyDown);
    const root = document.documentElement;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = root.style.overflow;
    const previousData = root.getAttribute("data-scroll-locked");
    const previousVar = root.style.getPropertyValue("--scrollbar-width");

    // Compute compensation BEFORE locking scroll so layout doesn't jump.
    // If `scrollbar-gutter: stable` is supported, the gutter already prevents width shifts,
    // so applying extra padding can cause a noticeable jitter.
    const hasStableScrollbarGutter =
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("scrollbar-gutter: stable");

    const scrollbarWidth = hasStableScrollbarGutter
      ? 0
      : Math.max(0, window.innerWidth - root.clientWidth);

    root.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
    root.setAttribute("data-scroll-locked", "true");

    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      root.style.overflow = previousRootOverflow;
      if (previousData === null) root.removeAttribute("data-scroll-locked");
      else root.setAttribute("data-scroll-locked", previousData);
      if (previousVar) root.style.setProperty("--scrollbar-width", previousVar);
      else root.style.removeProperty("--scrollbar-width");
    };
  }, [openModal]);

  const openStreamingModal = () => setOpenModal("streaming");
  const openAlbumModal = () => setOpenModal("album");
  const closeModal = () => setOpenModal(null);

  const gridClasses = cn(
    "grid",
    gridClassName ?? "grid-cols-2 gap-2 sm:grid-cols-4"
  );

  const buttons = (
    <div className={gridClasses}>
      {actions.map((action) => {
        const legacyStreaming = action.label.trim() === "원클릭 스트리밍";
        const legacyAlbum = action.label.trim() === "REVERXE 앨범구매";
        const isStreaming = action.kind === "streamingModal" || legacyStreaming;
        const isAlbum = action.kind === "albumModal" || legacyAlbum;
        const isSmsVote = action.kind === "smsVote";

        const shared = {
          variant: buttonVariant,
          size: buttonSize,
          className: cn("w-full", buttonClassName),
        } as const;


        if (isStreaming) {
          return (
            <Button
              key={action.label}
              {...shared}
              onClick={openStreamingModal}
            >
              <span className="inline-flex items-center gap-2 justify-center align-middle h-[22px]">
                <span className={action.label === "가이드" ? "flex items-center h-full relative top-[1px]" : "flex items-center h-full"}>{actionIcons[action.label]}</span>
                <span className="flex items-center h-full">{action.label}</span>
              </span>
            </Button>
          );
        }

        if (isAlbum) {
          return (
            <Button
              key={action.label}
              {...shared}
              onClick={openAlbumModal}
            >
              <span className="inline-flex items-center gap-2">
                {actionIcons[action.label]}
                {action.label}
              </span>
            </Button>
          );
        }

        if (isSmsVote) {
          return (
            <Button key={action.label} {...shared} onClick={() => openSmsVote(action)}>
              <span className="inline-flex items-center gap-2">
                {actionIcons[action.label]}
                {action.label}
              </span>
            </Button>
          );
        }

        const isExternal = action.href.startsWith("http") || action.href.startsWith("sms:");

        return (
          <a
            key={action.label}
            href={action.href}
            target={isExternal && action.href.startsWith("http") ? "_blank" : undefined}
            rel={isExternal && action.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="w-full"
          >
            <Button {...shared}>
              <span className="inline-flex items-center gap-2">
                {actionIcons[action.label]}
                {action.label}
              </span>
            </Button>
          </a>
        );
      })}
    </div>
  );

  return (
    <>
      {containerVariant === "card" ? (
        <Card className={cn("rounded-2xl", containerClassName)}>
          <CardContent className="p-3">{buttons}</CardContent>
        </Card>
      ) : (
        <div className={containerClassName}>{buttons}</div>
      )}

      {openModal ? (
        <div className="fixed inset-0 z-40">
          <button
            aria-label="닫기"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={openModal === "streaming" ? "스트리밍 리스트" : "앨범 구매"}
            className="relative mx-auto mt-24 w-[min(520px,calc(100%-2rem))] rounded-2xl border border-foreground/10 bg-background p-4 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-base font-semibold">
                {openModal === "streaming" ? "스트리밍 리스트" : "앨범 구매"}
              </div>
              <Button size="sm" variant="ghost" onClick={closeModal}>
                닫기
              </Button>
            </div>

            {openModal === "streaming" ? (
              <>
                {oneClickStreamingLinks && oneClickStreamingLinks.length > 0 ? (
                  <div className="mt-4">
                    <OneClickStreamingGrid
                      links={oneClickStreamingLinks}
                      columnsClassName="grid-cols-2 gap-2 sm:grid-cols-3"
                      buttonVariant="secondary"
                    />
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-foreground/10 bg-white p-3 text-sm text-foreground/70">
                    원클릭 스트리밍 링크 준비중
                  </div>
                )}
              </>
            ) : (
              <>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(albumLinks ?? []).map((link) => (
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
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
