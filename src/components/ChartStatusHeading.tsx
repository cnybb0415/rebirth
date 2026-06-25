"use client";

import { useEffect, useState } from "react";

type ChartStatusHeadingProps = {
  trackTitle: string;
  className?: string;
  showTime?: boolean;
};

function formatKst(date: Date, showTime: boolean): string {
  const baseParts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = baseParts.find((p) => p.type === "year")?.value ?? "";
  const month = baseParts.find((p) => p.type === "month")?.value ?? "";
  const day = baseParts.find((p) => p.type === "day")?.value ?? "";

  const ymd = `${year}.${month}.${day}`;
  if (!showTime) return ymd;

  const timeParts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = timeParts.find((p) => p.type === "hour")?.value ?? "";
  const minute = timeParts.find((p) => p.type === "minute")?.value ?? "";

  return `${ymd} ${hour}:${minute}`;
}

export function ChartStatusHeading({
  trackTitle,
  className,
  showTime = true,
}: ChartStatusHeadingProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const safeTitle = trackTitle.trim().length > 0 ? trackTitle.trim() : "노래제목";

  return (
    <h2 className={className} aria-live="polite">
      <span className="text-[1.125rem]">{safeTitle}</span>
      <span className="ml-1">의 실시간 차트 현황</span>
      <span className="ml-2 text-[0.7rem] text-foreground/60">
        {now ? formatKst(now, showTime) : ""}
      </span>
    </h2>
  );
}
