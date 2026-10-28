"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import { labLang, type LabLang } from "@/data/lab";
import { MamaVoteDialog, isMamaVoteOver, todayKst } from "@/components/MamaVoteDialog";

// 사이트 입장 시 뜨는 EXO 투표 광고 팝업
// - 새로고침·새로 들어올 때마다 뜸. 닫은 뒤 사이트 안에서 다른 페이지로 이동할 땐 다시 안 뜸(화면 틀이 유지돼서)
// - 내용은 MamaVoteDialog 공용 (EXO.zip 다운로드 광고와 같은 화면)
// - "오늘 하루 보지 않기"는 이 브라우저에만 저장 (한국 시간 기준 날짜)
// - 투표 기간이 끝나면 자동으로 안 뜸

const HIDE_KEY = "home-vote-popup-hidden";

const COPY: Record<LabLang, { hideToday: string; close: string }> = {
  ko: { hideToday: "오늘 하루 보지 않기", close: "닫기" },
  en: { hideToday: "Don't show today", close: "Close" },
};

const readHidden = () => {
  if (isMamaVoteOver()) return true;
  try {
    return localStorage.getItem(HIDE_KEY) === todayKst();
  } catch {
    return false;
  }
};
const noopSubscribe = () => () => {};

export function HomeVotePopup() {
  const lang = labLang(useLocale());
  const c = COPY[lang];
  // 서버에서는 숨긴 상태로 그려서, 오늘 숨긴 사람에게 팝업이 번쩍 보이지 않게 함
  const hiddenToday = useSyncExternalStore(noopSubscribe, readHidden, () => true);
  const [closed, setClosed] = useState(false);
  const open = !hiddenToday && !closed;

  const close = () => setClosed(true);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setClosed(true);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  const hideToday = () => {
    try {
      localStorage.setItem(HIDE_KEY, todayKst());
    } catch {}
    close();
  };

  return (
    <MamaVoteDialog
      lang={lang}
      titleId="home-vote-popup-title"
      onClose={close}
      imageMaxH="max-h-[calc(100svh-205px)]"
      howToMaxH="max-h-[calc(100svh-170px)]"
      footer={
        <div className="flex text-xs text-white/55">
          <button type="button" onClick={hideToday} className="flex-1 py-3 hover:bg-white/[0.04] hover:text-white/80">
            {c.hideToday}
          </button>
          <span className="w-px bg-white/10" aria-hidden />
          <button type="button" onClick={close} className="flex-1 py-3 font-semibold text-white/90 hover:bg-white/[0.04]">
            {c.close}
          </button>
        </div>
      }
    />
  );
}
