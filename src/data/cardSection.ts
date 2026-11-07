"use client";

import { useEffect, useState } from "react";
import { CARD_DAYS } from "./cardSectionDays";

export { CARD_DAYS, FIRST_OPEN_AT } from "./cardSectionDays";

// 서버 시각과 이 기기 시계의 차이 — 폰 시계가 틀려도 서버(한국시간) 기준으로 열림
let offsetPromise: Promise<number> | null = null;
function serverOffset(): Promise<number> {
  offsetPromise ??= fetch("/api/card-section?meta=1", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((j: { now: number }) => j.now - Date.now())
    .catch(() => {
      offsetPromise = null; // 다음에 다시 시도
      return 0;
    });
  return offsetPromise;
}

// 지금 공개된 날짜 목록 (30초마다 다시 확인 → 페이지를 열어 둔 채로 시간이 돼도 열림)
export function useCardClock() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    let offset = 0;
    let alive = true;
    const tick = () => alive && setNow(Date.now() + offset);
    serverOffset().then((o) => {
      offset = o;
      tick();
    });
    const id = setInterval(tick, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
  if (now === null) return null; // 서버 시각을 받기 전
  return { now, open: CARD_DAYS.filter((d) => now >= Date.parse(d.openAt)) };
}

export function useOpenCardDays() {
  return useCardClock()?.open ?? null;
}
