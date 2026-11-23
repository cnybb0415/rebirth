import type { ComponentType, SVGProps } from "react";
import { Link } from "@/i18n/navigation";

// 메뉴 목록(가이드·스트리밍·서포트)을 홈 바로가기처럼 2칸 타일로
export type MenuTile = {
  id: string;
  label: string;
  en: string; // 타일 위 작은 영문 표시
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  href?: string;
  onClick?: () => void;
};

const tileClass =
  "home-card group relative flex min-h-[128px] w-full flex-col justify-between rounded-[18px] border border-foreground/10 p-4 text-left transition hover:border-foreground/30 active:scale-[0.98] odd:last:col-span-2 odd:last:min-h-[96px]";

export function MenuTiles({ items }: { items: MenuTile[] }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map(({ id, label, en, Icon, href, onClick }, i) => {
        const inner = (
          <>
            <span className="flex items-start justify-between">
              <Icon className="h-6 w-6 text-foreground/85" strokeWidth={1.6} aria-hidden />
              <span className="font-display text-[13px] leading-none text-foreground/30 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
            </span>
            <span>
              <span className="font-display block text-[12px] leading-none tracking-[0.1em] text-foreground/40">{en}</span>
              <span className="mt-1.5 block text-[16px] font-bold leading-snug break-keep">{label}</span>
            </span>
            <span
              aria-hidden
              className="absolute right-4 bottom-4 text-foreground/30 transition group-hover:translate-x-0.5 group-hover:text-foreground/70"
            >
              ›
            </span>
          </>
        );
        return href ? (
          <Link key={id} href={href} className={tileClass}>
            {inner}
          </Link>
        ) : (
          <button key={id} type="button" onClick={onClick} className={tileClass}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}
