import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

// 페이지 맨 위 공통 머리: 왼쪽 위 뒤로가기 → 제목 → 설명. 버튼은 좁은 화면에서 아래로 내려감
export function PageHeader({
  title,
  back,
  description,
  meta,
  actions,
}: {
  title: ReactNode;
  back?: { href: string; label: ReactNode };
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div>
      {back ? (
        <Link
          href={back.href}
          className="mb-3 inline-flex items-center gap-1 text-[13px] font-medium text-foreground/55 transition hover:text-foreground"
        >
          <span aria-hidden>‹</span>
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-tight">{title}</h1>
          {description ? <p className="mt-1.5 text-sm text-foreground/60">{description}</p> : null}
          {meta ? <div className="mt-1.5">{meta}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
