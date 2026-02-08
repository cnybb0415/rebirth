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

type ScheduleCategory = "공연" | "앨범" | "기념일" | "영상" | "티켓팅";

type ScheduleItem = {
  id: string;
  date: string;
  time?: string;
  title: string;
  category: ScheduleCategory;
  city?: string;
  country?: string;
  venue?: string;
};

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

const excelScheduleItems: ScheduleItem[] = [
  { id: "2026-01-03-cube-01", date: "2026-01-03", title: "Teaser Image [Cube] #01", category: "앨범" },
  { id: "2026-01-04-cube-02", date: "2026-01-04", title: "Teaser Image [Cube] #02", category: "앨범" },
  { id: "2026-01-05-cube-03", date: "2026-01-05", title: "Teaser Image [Cube] #03", category: "앨범" },
  { id: "2026-01-06-reverse-01", date: "2026-01-06", title: "Teaser Image [Reverse] #01", category: "앨범" },
  { id: "2026-01-07-reverse-02", date: "2026-01-07", title: "Teaser Image [Reverse] #02", category: "앨범" },
  { id: "2026-01-08-reverse-03", date: "2026-01-08", title: "Teaser Image [Reverse] #03", category: "앨범" },
  { id: "2026-01-09-reverse-04", date: "2026-01-09", title: "Teaser Image [Reverse] #04", category: "앨범" },
  { id: "2026-01-12-do-bday", date: "2026-01-12", title: "HAPPAY D.O. DAY", category: "기념일" },
  { id: "2026-01-12-album-detail", date: "2026-01-12", title: "앨범 디테일 공개", category: "앨범" },
  { id: "2026-01-14-kai-bday", date: "2026-01-14", title: "HAPPAY KAI DAY", category: "기념일" },
  { id: "2026-01-15-mv-teaser-01", date: "2026-01-15", title: "M/V Teaser Image #01", category: "앨범" },
  { id: "2026-01-16-mv-teaser-02", date: "2026-01-16", title: "M/V Teaser Image #02", category: "앨범" },
  { id: "2026-01-17-mma-behind", date: "2026-01-17", title: "MMA2025 Behind", category: "영상" },
  { id: "2026-01-18-mv-teaser-release", date: "2026-01-18", title: "M/V Teaser Release", category: "앨범" },
  {
    id: "2026-01-19-album-release",
    date: "2026-01-19",
    time: "18:00",
    title: "REVERXE' Albun & M/V Release",
    category: "앨범",
  },
  {
    id: "2026-01-19-showcase",
    date: "2026-01-19",
    time: "19:30",
    title: "EXO REVERXE Showcase",
    category: "공연",
    city: "SEOUL",
    country: "KOREA",
    venue: "경희대 평화의 전당",
  },
  {
    id: "2026-01-22-mnet",
    date: "2026-01-22",
    time: "18:00",
    title: "전과자 (카이, 세훈) · Mnet 엠카운트다운",
    category: "영상",
  },
  { id: "2026-01-22-pinkcab", date: "2026-01-22", time: "19:00", title: "핑크 캐비닛 (수호, 찬열)", category: "영상" },
  { id: "2026-01-23-musicbank", date: "2026-01-23", time: "17:25", title: "KBS 뮤직뱅크", category: "영상" },
  { id: "2026-01-23-halmyeongsu", date: "2026-01-23", time: "17:30", title: "할명수", category: "영상" },
  { id: "2026-01-23-jipdaesung", date: "2026-01-23", time: "18:00", title: "집대성 (수호,카이)", category: "영상" },
  { id: "2026-01-24-musiccore", date: "2026-01-24", time: "15:20", title: "MBC 쇼! 음악중심", category: "영상" },
  { id: "2026-01-24-amazing-sat", date: "2026-01-24", time: "19:40", title: "tvN 놀라운 토요일 (수호, 찬열)", category: "영상" },
  { id: "2026-01-25-inkigayo", date: "2026-01-25", time: "15:20", title: "SBS 인기가요", category: "영상" },
  { id: "2026-01-25-relaydance", date: "2026-01-25", title: "릴레이댄스- Crown (4K)", category: "영상" },
  { id: "2026-01-30-spotify", date: "2026-01-30", time: "20:00", title: "Spotify Line by Line", category: "영상" },
  { id: "2026-01-30-channel-15", date: "2026-01-30", time: "18:00", title: "채널 십오야 나영석의 와글와글", category: "영상" },
  {
    id: "2026-01-31-smtown-fukuoka",
    date: "2026-01-31",
    time: "17:00",
    title: "SMTOWN LIVE in FUKUOKA",
    category: "공연",
    city: "FUKUOKA",
    country: "JAPAN",
    venue: "MIZUHO PayPay Dome",
  },
  {
    id: "2026-02-01-smtown-fukuoka",
    date: "2026-02-01",
    time: "16:00",
    title: "SMTOWN LIVE in FUKUOKA",
    category: "공연",
    city: "FUKUOKA",
    country: "JAPAN",
    venue: "MIZUHO PayPay Dome",
  },
  { id: "2026-02-02-spotify-party", date: "2026-02-02", title: "Spotify 디오와 카이의 생일파티", category: "영상" },
  {
    id: "2026-02-08-youtube",
    date: "2026-02-08",
    time: "22:00",
    title: "<Crown to the Throne> 1편 유튜브 공개",
    category: "영상",
  },
  { id: "2026-02-12-presale", date: "2026-02-12", time: "20:00", title: "EXhOrizon in SEOUL 선예매", category: "티켓팅" },
  { id: "2026-02-13-onsale", date: "2026-02-13", time: "20:00", title: "EXhOrizon in SEOUL 일반예매", category: "티켓팅" },
  {
    id: "2026-02-14-smtown-bangkok",
    date: "2026-02-14",
    time: "20:30",
    title: "SMTOWN LIVE in BANGKOK",
    category: "공연",
    city: "BANGKOK",
    country: "THAILAND",
    venue: "RAJAMANGALA NATIONAL STADIUM",
  },
  {
    id: "2026-03-04-episode-1",
    date: "2026-03-04",
    time: "20:00",
    title: "엑사세5 첫방송 (엠넷, 웨이브 공개)",
    category: "영상",
  },
  { id: "2026-03-11-episode-2", date: "2026-03-11", time: "20:00", title: "엑사세5 EP2. 방송 (엠넷, 웨이브)", category: "영상" },
  { id: "2026-03-18-episode-3", date: "2026-03-18", time: "20:00", title: "엑사세5 EP3. 방송 (엠넷, 웨이브)", category: "영상" },
  { id: "2026-03-25-episode-4", date: "2026-03-25", time: "20:00", title: "엑사세5 EP4. 방송 (엠넷, 웨이브)", category: "영상" },
  { id: "2026-04-01-episode-5", date: "2026-04-01", time: "20:00", title: "엑사세5 EP5. 방송 (엠넷, 웨이브)", category: "영상" },
  { id: "2026-04-08-debut", date: "2026-04-08", title: "EXO Debut 14th Anniversary", category: "기념일" },
  { id: "2026-04-08-final", date: "2026-04-08", time: "20:00", title: "엑사세5 마지막 방송 (엠넷, 웨이브)", category: "영상" },
  { id: "2026-04-12-sehun", date: "2026-04-12", title: "HAPPAY SEHUN DAY", category: "기념일" },
  { id: "2026-05-22-suho", date: "2026-05-22", title: "HAPPAY SUHO DAY", category: "기념일" },
  { id: "2026-10-07-lay", date: "2026-10-07", title: "HAPPAY LAY DAY", category: "기념일" },
  { id: "2026-11-27-chanyeol", date: "2026-11-27", title: "HAPPAY CHANYEOL DAY", category: "기념일" },
];

const tourScheduleItems: ScheduleItem[] = tourEvents.flatMap((eventItem) =>
  eventItem.dates.map((date) => ({
    id: `${eventItem.id}-${date}`,
    date,
    title: `EXO PLANET #6 - EXhOrizon in ${eventItem.city}`,
    category: "공연",
    city: eventItem.city,
    country: eventItem.country,
    venue: eventItem.venue,
  }))
);

const scheduleItems: ScheduleItem[] = [...excelScheduleItems, ...tourScheduleItems];

const eventByDate = scheduleItems.reduce<Record<string, ScheduleItem[]>>(
  (acc, eventItem) => {
    acc[eventItem.date] ??= [];
    acc[eventItem.date].push(eventItem);
    return acc;
  },
  {},
);

function compareTimes(a?: string, b?: string): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

function CategoryIcon({ category }: { category: ScheduleCategory }) {
  if (category === "공연") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4 text-rose-500"
        fill="currentColor"
      >
        <path d="M12 2c-3.314 0-6 2.686-6 6 0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4z" />
      </svg>
    );
  }
  if (category === "앨범") return <Disc className="h-4 w-4 text-foreground/70" />;
  if (category === "기념일") return <Cake className="h-4 w-4 text-foreground/70" />;
  if (category === "영상") return <Video className="h-4 w-4 text-foreground/70" />;
  return <Ticket className="h-4 w-4 text-foreground/70" />;
}

function getCategoryBadgeClass(category: ScheduleCategory): string {
  switch (category) {
    case "공연":
      return "bg-rose-100 text-rose-700";
    case "앨범":
      return "bg-slate-200 text-slate-700";
    case "기념일":
      return "bg-amber-100 text-amber-700";
    case "영상":
      return "bg-sky-100 text-sky-700";
    case "티켓팅":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-foreground/10 text-foreground";
  }
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
                      const sortedEvents = [...dayEvents].sort((a, b) => compareTimes(a.time, b.time));
                      const displayEvents = sortedEvents.slice(0, 2);
                      const dayCategories = Array.from(
                        new Set(dayEvents.map((eventItem) => eventItem.category))
                      ).slice(0, 3);
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
                            "relative flex min-h-16 flex-col items-start justify-start gap-1 rounded-lg border border-foreground/5 px-1 py-1 text-sm transition" +
                            (day ? " bg-foreground/5" : " bg-transparent") +
                            (isSunday ? " text-rose-500" : "") +
                            (isSaturday ? " text-blue-500" : "") +
                            (!isSunday && !isSaturday ? " text-foreground/80" : "") +
                            (isSelected ? " ring-2 ring-foreground/30" : "") +
                            (day ? " hover:bg-foreground/10" : "")
                          }
                          aria-label={day ? `${monthItem.name} ${day}일` : undefined}
                        >
                          <span className="text-xs font-semibold leading-none">{day ?? ""}</span>
                          {hasEvent && day ? (
                            <span className="absolute right-0.5 top-0.5 flex items-center gap-0.5 sm:right-1 sm:top-1">
                              {dayCategories.map((category) => (
                                <span key={`${dateKey}-${category}`} className="h-3.5 w-3.5 sm:h-4 sm:w-4">
                                  <CategoryIcon category={category} />
                                </span>
                              ))}
                            </span>
                          ) : null}
                          {hasEvent ? (
                            <span className="mt-1 flex w-full flex-col items-start gap-0.5">
                              {displayEvents.map((eventItem) => (
                                <span
                                  key={`${dateKey}-${eventItem.id}-badge`}
                                  className={
                                    "w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium leading-tight " +
                                    getCategoryBadgeClass(eventItem.category)
                                  }
                                  title={eventItem.title}
                                >
                                  {eventItem.title}
                                </span>
                              ))}
                              {dayEvents.length > displayEvents.length ? (
                                <span className="text-[10px] text-foreground/50">+{dayEvents.length - displayEvents.length}</span>
                              ) : null}
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
                                    <span className="text-xs font-semibold text-foreground/70">
                                      {eventItem.time}
                                    </span>
                                  ) : null}
                                  <span className="text-xs text-foreground/60">{eventItem.category}</span>
                                </div>
                                <div className="mt-1 font-semibold text-foreground">
                                  {eventItem.title}
                                </div>
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
      </div>
    </main>
  );
}
