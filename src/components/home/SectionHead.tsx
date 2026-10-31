import type { ReactNode } from "react";

// 메인 섹션 머리: 작은 번호 라벨 + 큰 세리프 제목(마지막 단어 이탤릭) + 오른쪽 링크
export function SectionHead({
  no,
  label,
  title,
  em,
  right,
  id,
}: {
  no: string;
  label: string;
  title: string;
  em?: string;
  right?: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e655b]">
          {no} — {label}
        </p>
        <h2 id={id} className="font-display mt-2 text-[34px] leading-[0.95] tracking-[-0.01em] text-[#221e1a] sm:text-[44px]">
          {title}
          {em ? (
            <>
              {" "}
              <em className="italic">{em}</em>
            </>
          ) : null}
        </h2>
      </div>
      {right ? <div className="shrink-0 pb-1">{right}</div> : null}
    </div>
  );
}

// "전체 보기" 같은 작은 알약 링크 (Link / a 어디에나 className 으로)
export const PILL =
  "inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-full border border-[#221e1a]/15 px-3.5 text-[12px] font-semibold text-[#221e1a] transition hover:bg-[#221e1a] hover:text-[#faf6ef]";

export const HOME_CARD = "rounded-[28px] border border-[#e2d8c8] bg-[#faf6ef] p-5 sm:p-7";
