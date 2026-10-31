import type { ReactNode } from "react";

// 메인 섹션 머리: 작은 번호 라벨 + 큰 세리프 제목(마지막 단어 이탤릭) + 오른쪽 링크
export function SectionHead({
  label,
  right,
  id,
}: {
  no?: string;
  label: string;
  title?: string;
  em?: string;
  right?: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      <h2 id={id} className="min-w-0 truncate text-[17px] font-bold text-[#18181b]">
        {label}
      </h2>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

// "전체 보기" 같은 작은 알약 링크 (Link / a 어디에나 className 으로)
export const PILL =
  "-mr-1 inline-flex min-h-11 items-center gap-0.5 whitespace-nowrap px-1 text-[13px] font-medium text-[#71717a] transition hover:text-[#18181b]";

export const HOME_CARD = "rounded-2xl border border-[#e4e4e7] bg-white p-5 sm:p-6";
