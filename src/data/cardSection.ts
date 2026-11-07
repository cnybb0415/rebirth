"use client";

import { useEffect, useState } from "react";

// 카드섹션 공개 시간 (입장 전에 열림)
export const CARD_DAYS = [
  { id: "1107", openAt: "2026-11-07T16:10:00+09:00", endsAt: "2026-11-07T23:59:59+09:00" },
  { id: "1108", openAt: "2026-11-08T15:10:00+09:00", endsAt: "2026-11-08T23:59:59+09:00" },
] as const;

export const FIRST_OPEN_AT = CARD_DAYS[0].openAt;

// 지금 공개된 날짜 목록 (30초마다 다시 확인 → 페이지를 열어 둔 채로 시간이 돼도 열림)
export function useCardClock() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  if (now === null) return null; // 서버 렌더·첫 화면에서는 아직 모름
  return { now, open: CARD_DAYS.filter((d) => now >= Date.parse(d.openAt)) };
}

export function useOpenCardDays() {
  return useCardClock()?.open ?? null;
}
