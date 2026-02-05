"use client";

import * as React from "react";

const year = 2026;

const months = [
  { name: "1월", month: 0 },
  { name: "2월", month: 1 },
  { name: "3월", month: 2 },
  { name: "4월", month: 3 },
  { name: "5월", month: 4 },
  { name: "6월", month: 5 },
  { name: "7월", month: 6 },
  { name: "8월", month: 7 },
  { name: "9월", month: 8 },
  { name: "10월", month: 9 },
  { name: "11월", month: 10 },
  { name: "12월", month: 11 },
];

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

type TourEvent = {
  id: string;
  city: string;
  country: string;
  venue: string;
  dates: string[];
};

const tourEvents: TourEvent[] = [
  {
    id: "seoul",
    city: "SEOUL",
    country: "KOREA",
    venue: "KSPO DOME",
    dates: ["2026-04-10", "2026-04-11", "2026-04-12"],
  },
  {
    id: "hcmc",
    city: "HO CHI MINH CITY",
    country: "VIETNAM",
    venue: "SECC OUTDOOR",
    dates: ["2026-04-25"],
  },
  {
    id: "nagoya",
    city: "NAGOYA",
    country: "JAPAN",
    venue: "NIPPON GAISHI HALL",
    dates: ["2026-05-02", "2026-05-03"],
  },
  {
    id: "bangkok",
    city: "BANGKOK",
    country: "THAILAND",
    venue: "IMPACT ARENA",
    dates: ["2026-05-16", "2026-05-17"],
  },
  {
    id: "macau",
    city: "MACAU",
    country: "MACAU",
    venue: "GALAXY ARENA",
    dates: ["2026-05-22", "2026-05-23"],
  },
  {
    id: "osaka",
    city: "OSAKA",
    country: "JAPAN",
    venue: "OSAKA-JO HALL",
    dates: ["2026-06-02", "2026-06-03"],
  },
  {
    id: "jakarta",
    city: "JAKARTA",
    country: "INDONESIA",
    venue: "INDONESIA ARENA",
    dates: ["2026-06-07"],
  },
  {
    id: "hongkong",
    city: "HONG KONG",
    country: "HONG KONG",
    venue: "ASIAWORLD-ARENA",
    dates: ["2026-06-13", "2026-06-14"],
  },
  {
    id: "kualalumpur",
    city: "KUALA LUMPUR",
    country: "MALAYSIA",
    venue: "NATIONAL HOCKEY STADIUM",
    dates: ["2026-06-20"],
  },
  {
    id: "manila",
    city: "MANILA",
    country: "PHILIPPINES",
    venue: "SM MALL OF ASIA ARENA",
    dates: ["2026-07-04", "2026-07-05"],
  },
  {
    id: "tokyo",
    city: "TOKYO",
    country: "JAPAN",
    venue: "LaLa arena TOKYO-BAY",
    dates: ["2026-07-11", "2026-07-12"],
  },
  {
    id: "kaohsiung",
    city: "KAOHSIUNG",
    country: "TAIWAN",
    venue: "KAOHSIUNG ARENA",
    dates: ["2026-07-18"],
  },
  {
    id: "singapore",
    city: "SINGAPORE",
    country: "SINGAPORE",
    venue: "SINGAPORE INDOOR STADIUM",
    dates: ["2026-07-26"],
  },
];

const eventByDate = tourEvents.reduce<Record<string, TourEvent[]>>(
  (acc, eventItem) => {
    eventItem.dates.forEach((date) => {
      acc[date] ??= [];
      acc[date].push(eventItem);
    });
    return acc;
  },
  {},
);

function toDateKey(targetYear: number, targetMonth: number, day: number) {
  const month = String(targetMonth + 1).padStart(2, "0");
  const date = String(day).padStart(2, "0");
  return `${targetYear}-${month}-${date}`;
}

function getMonthCells(targetYear: number, targetMonth: number) {
  const firstDay = new Date(targetYear, targetMonth, 1).getDay();
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
}

export default function SchedulePage() {
  const today = new Date();
  const isTargetYear = today.getFullYear() === year;
  const initialIndex = isTargetYear ? today.getMonth() : 0;
  const initialSelectedDate = isTargetYear
    ? toDateKey(year, today.getMonth(), today.getDate())
    : null;

  const [index, setIndex] = React.useState(() => initialIndex);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(() => initialSelectedDate);
  const total = months.length;

  const goPrev = React.useCallback(() => {
    setIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goNext = React.useCallback(() => {
    setIndex((prev) => (prev + 1) % total);
  }, [total]);

  React.useEffect(() => {
    if (!selectedDate) return;
    const currentMonthPrefix = `${year}-${String(months[index].month + 1).padStart(2, "0")}`;
    if (!selectedDate.startsWith(currentMonthPrefix)) {
      setSelectedDate(null);
    }
  }, [index, selectedDate]);

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">EXO 스케줄</h1>
      </div>

      <div className="mt-8">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-white shadow-sm">
          <div
            className="flex w-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {months.map((monthItem) => {
              const cells = getMonthCells(year, monthItem.month);
              const monthPrefix = `${year}-${String(monthItem.month + 1).padStart(2, "0")}`;
              const monthEvents = Object.entries(eventByDate).filter(([dateKey]) => dateKey.startsWith(monthPrefix));
              const selectedEvents = selectedDate ? eventByDate[selectedDate] ?? [] : [];

              return (
                <section key={`${year}-${monthItem.month}`} className="w-full flex-shrink-0 p-4 pb-10">
                  <div className="grid grid-cols-3 items-center">
                    <div className="flex justify-start">
                      <button
                        type="button"
                        onClick={goPrev}
                        aria-label="이전 달"
                        className="rounded-full border border-foreground/10 bg-white p-2 text-foreground/70 shadow-sm hover:bg-foreground/5"
                      >
                        <span className="block text-sm">‹</span>
                      </button>
                    </div>
                    <div className="text-center text-lg font-semibold">
                      {year}년 {monthItem.name}
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={goNext}
                        aria-label="다음 달"
                        className="rounded-full border border-foreground/10 bg-white p-2 text-foreground/70 shadow-sm hover:bg-foreground/5"
                      >
                        <span className="block text-sm">›</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-7 text-center text-xs font-semibold text-foreground/60">
                    {weekdays.map((day) => (
                      <div key={`${monthItem.name}-${day}`}>{day}</div>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-1 text-center text-sm">
                    {cells.map((day, cellIndex) => {
                      const isSunday = cellIndex % 7 === 0;
                      const isSaturday = cellIndex % 7 === 6;
                      const dateKey = day ? toDateKey(year, monthItem.month, day) : null;
                      const hasEvent = dateKey ? Boolean(eventByDate[dateKey]) : false;
                      const isSelected = dateKey && selectedDate === dateKey;
                      return (
                        <button
                          key={`${monthItem.name}-cell-${cellIndex}`}
                          type="button"
                          disabled={!day}
                          onClick={() => {
                            if (!dateKey) return;
                            setSelectedDate((prev) => (prev === dateKey ? null : dateKey));
                          }}
                          className={
                            "relative flex h-9 items-center justify-center rounded-lg border border-foreground/5 text-sm transition" +
                            (day ? " bg-foreground/5" : " bg-transparent") +
                            (isSunday ? " text-rose-500" : "") +
                            (isSaturday ? " text-blue-500" : "") +
                            (!isSunday && !isSaturday ? " text-foreground/80" : "") +
                            (isSelected ? " ring-2 ring-foreground/30" : "") +
                            (day ? " hover:bg-foreground/10" : "")
                          }
                          aria-label={day ? `${monthItem.name} ${day}일` : undefined}
                        >
                          {day ?? ""}
                          {hasEvent && day ? (
                            <span className="absolute right-0.5 top-0.5 sm:right-1 sm:top-1">
                              <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                className="h-3.5 w-3.5 text-rose-500 sm:h-4 sm:w-4"
                                fill="currentColor"
                              >
                                <path d="M12 2c-3.314 0-6 2.686-6 6 0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4z" />
                              </svg>
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 rounded-2xl border border-foreground/10 bg-white p-4 text-sm text-foreground/70">
                    {selectedDate && selectedEvents.length > 0 ? (
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-foreground">{selectedDate}</div>
                        <ul className="space-y-2">
                          {selectedEvents.map((eventItem) => (
                            <li key={`${selectedDate}-${eventItem.id}`}>
                              <div className="font-semibold text-foreground">
                                EXO PLANET #6 - EXhOrizon in {eventItem.country}
                              </div>
                              <div className="text-sm text-foreground/70">
                                {eventItem.city} · {eventItem.venue}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div>
                        상세 정보는 날짜를 클릭해주세요.
                        {monthEvents.length ? "" : " (해당 월 일정 없음)"}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
            {months.map((_, monthIndex) => (
              <button
                key={`month-dot-${monthIndex}`}
                type="button"
                onClick={() => setIndex(monthIndex)}
                aria-label={`${months[monthIndex].name} 보기`}
                className={
                  "h-2 w-2 rounded-full border border-foreground/30 transition" +
                  (monthIndex === index ? " bg-foreground" : " bg-transparent")
                }
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
