"use client";

import * as React from "react";
import { Cake, Disc, Ticket, Video } from "lucide-react";

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

export type ScheduleCategory = "공연" | "앨범" | "기념일" | "영상" | "티켓팅";

export type ScheduleItem = {
  id: string;
  date: string;
  time?: string;
  title: string;
  category: ScheduleCategory;
  city?: string;
  country?: string;
  venue?: string;
};

function CategoryIcon({ category }: { category: ScheduleCategory }) {
  if (category === "공연") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 text-rose-500" fill="currentColor">
        <path d="M12 2c-3.314 0-6 2.686-6 6 0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4z" />
      </svg>
    );
  }
  if (category === "앨범") return <Disc className="h-4 w-4 text-foreground/70" />;
  if (category === "기념일") return <Cake className="h-4 w-4 text-foreground/70" />;
  if (category === "영상") return <Video className="h-4 w-4 text-foreground/70" />;
  return <Ticket className="h-4 w-4 text-foreground/70" />;
}

function getCategoryPriority(category: ScheduleCategory): number {
  switch (category) {
    case "기념일": return 1;
    case "공연": return 2;
    case "앨범": return 3;
    case "티켓팅": return 4;
    case "영상": return 5;
    default: return 99;
  }
}

function getCategoryBadgeClass(category: ScheduleCategory): string {
  switch (category) {
    case "공연": return "bg-rose-100 text-rose-700";
    case "앨범": return "bg-slate-200 text-slate-700";
    case "기념일": return "bg-amber-100 text-amber-700";
    case "영상": return "bg-sky-100 text-sky-700";
    case "티켓팅": return "bg-emerald-100 text-emerald-700";
    default: return "bg-foreground/10 text-foreground";
  }
}

function compareTimes(a?: string, b?: string): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

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

export function ScheduleCalendar({ items }: { items: ScheduleItem[] }) {
  const today = new Date();
  const isTargetYear = today.getFullYear() === year;
  const initialIndex = isTargetYear ? today.getMonth() : 0;
  const initialSelectedDate = isTargetYear
    ? toDateKey(year, today.getMonth(), today.getDate())
    : null;

  const [index, setIndex] = React.useState(() => initialIndex);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(() => initialSelectedDate);
  const total = months.length;

  const eventByDate = React.useMemo(
    () =>
      items.reduce<Record<string, ScheduleItem[]>>((acc, item) => {
        acc[item.date] ??= [];
        acc[item.date].push(item);
        return acc;
      }, {}),
    [items]
  );

  const goPrev = React.useCallback(() => setIndex((prev) => (prev - 1 + total) % total), [total]);
  const goNext = React.useCallback(() => setIndex((prev) => (prev + 1) % total), [total]);

  React.useEffect(() => {
    if (!selectedDate) return;
    const currentMonthPrefix = `${year}-${String(months[index].month + 1).padStart(2, "0")}`;
    if (!selectedDate.startsWith(currentMonthPrefix)) setSelectedDate(null);
  }, [index, selectedDate]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-white shadow-sm">
      <div
        className="flex w-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {months.map((monthItem) => {
          const cells = getMonthCells(year, monthItem.month);
          const monthPrefix = `${year}-${String(monthItem.month + 1).padStart(2, "0")}`;
          const monthEvents = Object.entries(eventByDate).filter(([dateKey]) => dateKey.startsWith(monthPrefix));
          const selectedEvents = selectedDate
            ? [...(eventByDate[selectedDate] ?? [])].sort((a, b) => compareTimes(a.time, b.time))
            : [];

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

              <div className="mt-2 grid grid-cols-7 gap-1 text-left text-sm">
                {cells.map((day, cellIndex) => {
                  const isSunday = cellIndex % 7 === 0;
                  const isSaturday = cellIndex % 7 === 6;
                  const dateKey = day ? toDateKey(year, monthItem.month, day) : null;
                  const dayEvents = dateKey ? eventByDate[dateKey] ?? [] : [];
                  const hasEvent = dayEvents.length > 0;
                  const sortedEvents = [...dayEvents].sort((a, b) => {
                    const priorityDiff = getCategoryPriority(a.category) - getCategoryPriority(b.category);
                    if (priorityDiff !== 0) return priorityDiff;
                    return compareTimes(a.time, b.time);
                  });
                  const displayEvents = sortedEvents.slice(0, 2);
                  const dayCategories = Array.from(new Set(dayEvents.map((e) => e.category))).slice(0, 3);
                  const primaryCategory = [...dayCategories].sort(
                    (a, b) => getCategoryPriority(a) - getCategoryPriority(b)
                  )[0];
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
                        "relative flex aspect-[1/1.4] flex-col items-start justify-start gap-1 overflow-hidden rounded-lg border border-foreground/5 px-1 py-1 text-sm transition sm:h-24 sm:aspect-auto" +
                        (day ? " bg-foreground/5" : " bg-transparent") +
                        (isSunday ? " text-rose-500" : "") +
                        (isSaturday ? " text-blue-500" : "") +
                        (!isSunday && !isSaturday ? " text-foreground/80" : "") +
                        (isSelected ? " ring-2 ring-foreground/30" : "") +
                        (day ? " hover:bg-foreground/10" : "")
                      }
                      aria-label={day ? `${monthItem.name} ${day}일` : undefined}
                    >
                      <span className="w-full pr-6 text-left text-xs font-semibold leading-none">
                        <span className="inline-flex h-3 items-center">{day ?? ""}</span>
                      </span>
                      {hasEvent && day ? (
                        <span className="absolute right-1 top-1 flex h-3 items-center gap-0.5 sm:right-1 sm:top-1 sm:h-4">
                          {primaryCategory ? (
                            <span className="h-3 w-3 sm:hidden">
                              <CategoryIcon category={primaryCategory} />
                            </span>
                          ) : null}
                          <span className="hidden items-center gap-0.5 sm:flex">
                            {dayCategories.map((category) => (
                              <span key={`${dateKey}-${category}`} className="h-3 w-3 sm:h-4 sm:w-4">
                                <CategoryIcon category={category} />
                              </span>
                            ))}
                          </span>
                        </span>
                      ) : null}
                      {hasEvent ? (
                        <span className="mt-1 flex w-full flex-col items-start gap-0.5">
                          <span className="w-full sm:hidden">
                            <span
                              className={"w-full truncate rounded px-1 py-0.5 text-left text-[9px] font-medium leading-tight " + getCategoryBadgeClass(displayEvents[0].category)}
                              title={displayEvents[0].title}
                            >
                              {displayEvents[0].title}
                            </span>
                            {dayEvents.length > 1 ? (
                              <span className="mt-0.5 block text-[9px] text-foreground/50">+{dayEvents.length - 1}</span>
                            ) : null}
                          </span>
                          <span className="hidden w-full flex-col items-start gap-0.5 sm:flex">
                            {displayEvents.map((eventItem) => (
                              <span
                                key={`${dateKey}-${eventItem.id}-badge`}
                                className={"w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium leading-tight " + getCategoryBadgeClass(eventItem.category)}
                                title={eventItem.title}
                              >
                                {eventItem.title}
                              </span>
                            ))}
                            {dayEvents.length > displayEvents.length ? (
                              <span className="text-[10px] text-foreground/50">+{dayEvents.length - displayEvents.length}</span>
                            ) : null}
                          </span>
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
                    <ul className="space-y-3">
                      {selectedEvents.map((eventItem) => (
                        <li key={`${selectedDate}-${eventItem.id}`} className="flex gap-3">
                          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5">
                            <CategoryIcon category={eventItem.category} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {eventItem.time ? (
                                <span className="text-xs font-semibold text-foreground/70">{eventItem.time}</span>
                              ) : null}
                              <span className="text-xs text-foreground/60">{eventItem.category}</span>
                            </div>
                            <div className="mt-1 font-semibold text-foreground">{eventItem.title}</div>
                            {eventItem.category === "공연" ? (
                              <div className="text-sm text-foreground/70">
                                {eventItem.city} · {eventItem.venue} · {eventItem.country}
                              </div>
                            ) : null}
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
  );
}
