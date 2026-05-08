import Link from "next/link";
import { unstable_cache } from "next/cache";

type ScheduleItem = {
  id: string;
  date: string;
  time?: string;
  title: string;
  category: string;
  city?: string;
};

type VoteItem = {
  name: string;
  organizer: string;
  link: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  공연: "bg-purple-100 text-purple-700",
  앨범: "bg-blue-100 text-blue-700",
  기념일: "bg-pink-100 text-pink-700",
  영상: "bg-red-100 text-red-700",
  티켓팅: "bg-orange-100 text-orange-700",
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current); current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function getKSTDateRange(): { today: string; end: string } {
  const now = new Date();
  const kst = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
  const endDate = new Date(kst);
  endDate.setDate(endDate.getDate() + 6);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { today: fmt(kst), end: fmt(endDate) };
}

const fetchUpcomingSchedule = unstable_cache(
  async (): Promise<ScheduleItem[]> => {
  const csvUrl = process.env.SCHEDULE_SHEET_CSV_URL;
  if (!csvUrl) return [];
  try {
    const res = await fetch(csvUrl);
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const { today, end } = getKSTDateRange();
    const VALID = new Set(["공연", "앨범", "기념일", "영상", "티켓팅"]);

    return lines.slice(1).flatMap((line, i) => {
      const cols = parseCSVLine(line).map((c) => c.trim());
      const [date, time, title, category, city] = cols;
      if (!date || !title || !category || !VALID.has(category)) return [];
      if (date < today || date > end) return [];
      return [{
        id: `sch-${i}-${date}`,
        date,
        time: time || undefined,
        title,
        category,
        city: city || undefined,
      }];
    }).sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
  },
  ["home-schedule"],
  { revalidate: 7200 }
);

const fetchActiveVotes = unstable_cache(
  async (): Promise<VoteItem[]> => {
  const csvUrl = process.env.VOTE_SHEET_CSV_URL;
  if (!csvUrl) return [];
  try {
    const res = await fetch(csvUrl);
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const now = new Date();
    return lines.slice(1).flatMap((line) => {
      const cols = parseCSVLine(line).map((c) => c.trim());
      const [, organizer, name, , deadline, link] = cols;
      if (!name) return [];
      const m = deadline?.match(/(\d{4})[.\-](\d{2})[.\-](\d{2})(?:\s+(\d{2}):(\d{2}))?/);
      if (!m) return [];
      const deadlineDate = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4] ?? "23"}:${m[5] ?? "59"}:00+09:00`);
      if (now > deadlineDate) return [];
      return [{ name, organizer: organizer ?? "", link: link ?? "" }];
    });
  } catch {
    return [];
  }
  },
  ["home-votes"],
  { revalidate: 3600 }
);

export async function HomeQuickView() {
  const [scheduleItems, voteItems] = await Promise.all([
    fetchUpcomingSchedule(),
    fetchActiveVotes(),
  ]);

  return (
    <div className="grid grid-cols-2 gap-3">

      {/* 이번 주 스케줄 */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-white p-2.5 shadow-sm sm:p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-tight sm:text-xs">이번 주 스케줄</span>
          <Link href="/schedule" className="text-[9px] text-foreground/40 hover:text-foreground/70 sm:text-[10px]">
            전체 →
          </Link>
        </div>

        <div className="mt-2 flex flex-1 flex-col gap-1 sm:mt-2.5 sm:gap-1.5">
          {scheduleItems.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-xl bg-neutral-50 text-[10px] text-foreground/35">
              예정 없음
            </div>
          ) : (
            <>
              {scheduleItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex flex-1 flex-col justify-center rounded-xl bg-neutral-50 px-2 sm:px-2.5">
                  <div className="flex items-center gap-1">
                    <span className="shrink-0 text-[9px] font-bold tabular-nums text-foreground/45 sm:text-[10px]">
                      {item.date.slice(5).replace("-", "/")}
                    </span>
                    <span className={`rounded-full px-1 py-px text-[8px] font-bold leading-none sm:px-1.5 sm:text-[9px] ${CATEGORY_COLORS[item.category] ?? "bg-neutral-100 text-neutral-500"}`}>
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[10px] font-semibold leading-tight sm:text-[11px]">
                    {item.title}
                  </p>
                  {item.city && (
                    <p className="mt-0.5 truncate text-[9px] text-foreground/40 sm:text-[10px]">{item.city}</p>
                  )}
                </div>
              ))}
              {scheduleItems.length > 3 && (
                <Link href="/schedule" className="block shrink-0 rounded-xl bg-neutral-50 py-1 text-center text-[9px] font-medium text-foreground/40 hover:text-foreground/60 sm:py-1.5 sm:text-[10px]">
                  +{scheduleItems.length - 3}
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* 진행 중인 투표 */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-white p-2.5 shadow-sm sm:p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-tight sm:text-xs">진행 중인 투표</span>
          <Link href="/vote" className="text-[9px] text-foreground/40 hover:text-foreground/70 sm:text-[10px]">
            전체 →
          </Link>
        </div>

        <div className="mt-2 flex flex-1 flex-col gap-1 sm:mt-2.5 sm:gap-1.5">
          {voteItems.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-xl bg-neutral-50 text-[10px] text-foreground/35">
              진행 중 없음
            </div>
          ) : (
            <>
              {voteItems.slice(0, 4).map((item, i) => (
                <div key={i} className={`flex flex-1 flex-col justify-center gap-0.5 rounded-xl bg-neutral-50 px-2 sm:gap-1 sm:px-2.5${i >= 3 ? " hidden lg:flex" : ""}`}>
                  <p className="line-clamp-2 text-[10px] font-semibold leading-tight sm:text-[11px]">{item.name}</p>
                  <div className="flex items-center justify-between gap-1">
                    <p className="min-w-0 truncate text-[9px] text-foreground/40 sm:text-[10px]">{item.organizer}</p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-md bg-yellow-300 px-1.5 py-0.5 text-[8px] font-bold text-yellow-900 hover:bg-yellow-400 sm:rounded-lg sm:px-2 sm:text-[9px]"
                      >
                        투표↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {voteItems.length > 3 && (
                <Link href="/vote" className="block shrink-0 rounded-xl bg-neutral-50 py-1 text-center text-[9px] font-medium text-foreground/40 hover:text-foreground/60 sm:py-1.5 sm:text-[10px] lg:hidden">
                  +{voteItems.length - 3}
                </Link>
              )}
              {voteItems.length > 4 && (
                <Link href="/vote" className="hidden shrink-0 rounded-xl bg-neutral-50 py-1 text-center text-[9px] font-medium text-foreground/40 hover:text-foreground/60 sm:py-1.5 sm:text-[10px] lg:block">
                  +{voteItems.length - 4}
                </Link>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
