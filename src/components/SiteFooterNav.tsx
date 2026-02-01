"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Megaphone, Ticket } from "lucide-react";

type IconProps = {
  className?: string;
};


function IconMusic({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={
        className
          ? `${className} block translate-y-[1px] -translate-x-[1.5px]`
          : "block translate-y-[1px] -translate-x-[1.5px]"
      }
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

function IconHome({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10.5V21h14V10.5" />
      <path d="M10 21v-7h4v7" />
    </svg>
  );
}

function IconHeart({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconBalloon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2c-3.866 0-7 3.134-7 7 0 4.418 3.134 7 7 7s7-2.582 7-7c0-3.866-3.134-7-7-7z" />
      <path d="M12 16c-.9 1.1-1.7 1.9-2.6 2.6.8.3 1.7.5 2.6.5s1.8-.2 2.6-.5c-.9-.7-1.7-1.5-2.6-2.6z" />
      <path d="M12 19v3" />
      <path d="M12 22c0-1.2 1-2.2 2.2-2.2" />
    </svg>
  );
}

const items = [
  { label: "스케줄", href: "/schedule", Icon: CalendarDays },
  { label: "스트리밍", href: "/streaming", Icon: IconMusic },
  { label: "홈", href: "/", Icon: IconHome },
  { label: "콘서트", href: "/concert", Icon: Ticket },
  { label: "서포트", href: "/support", Icon: IconHeart },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-5 gap-1 px-2">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.Icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              "group flex flex-col items-center justify-center rounded-2xl px-1 py-2 text-[11px] font-medium transition " +
              (active
                ? "text-lime-700"
                : "text-foreground/70 hover:text-foreground")
            }
          >
            <span
              className={
                "mb-1 grid h-9 w-9 place-items-center rounded-xl transition " +
                (active
                  ? "bg-lime-600/20"
                  : "bg-foreground/5 group-hover:bg-foreground/10")
              }
              aria-hidden
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className={active ? "text-lime-700" : undefined}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function SiteFooterNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      className="scroll-lock-pad fixed inset-x-0 bottom-0 z-50 border-t border-foreground/10 bg-background"
      aria-label="하단 메뉴"
    >
      <div className="pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2">
        <NavLinks pathname={pathname} />
      </div>
    </nav>
  );
}
