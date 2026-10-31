import { unstable_cache } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HOME_CARD, PILL, SectionHead } from "@/components/home/SectionHead";

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
  deadline: string;
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

function getKSTToday(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
  return `${kst.getFullYear()}-${String(kst.getMonth() + 1).padStart(2, "0")}-${String(kst.getDate()).padStart(2, "0")}`;
}

function getKSTWeekEnd(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
  kst.setDate(kst.getDate() + 6);
  return `${kst.getFullYear()}-${String(kst.getMonth() + 1).padStart(2, "0")}-${String(kst.getDate()).padStart(2, "0")}`;
}

const fetchAllFutureSchedule = unstable_cache(
  async (): Promise<ScheduleItem[]> => {
    const csvUrl = process.env.SCHEDULE_SHEET_CSV_URL;
    if (!csvUrl) return [];
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) return [];
      const text = await res.text();
      const lines = text.trim().split("\n");
      if (lines.length < 2) return [];

      const VALID = new Set(["공연", "앨범", "기념일", "영상", "티켓팅"]);
      return lines.slice(1).flatMap((line, i) => {
        const cols = parseCSVLine(line).map((c) => c.trim());
        const [date, time, title, category, city] = cols;
        if (!date || !title || !category || !VALID.has(category)) return [];
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

const fetchRawVotes = unstable_cache(
  async (): Promise<VoteItem[]> => {
    const csvUrl = process.env.VOTE_SHEET_CSV_URL;
    if (!csvUrl) return [];
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) return [];
      const text = await res.text();
      const lines = text.trim().split("\n");
      if (lines.length < 2) return [];

      return lines.slice(1).flatMap((line) => {
        const cols = parseCSVLine(line).map((c) => c.trim());
        const [, organizer, name, , deadline, link] = cols;
        if (!name || !deadline) return [];
        return [{ name, organizer: organizer ?? "", deadline, link: link ?? "" }];
      });
    } catch {
      return [];
    }
  },
  ["home-votes"],
  { revalidate: 3600 }
);

function ScheduleItemRow({ item }: { item: ScheduleItem }) {
  const [, mm, dd] = item.date.split("-");
  return (
    <li className="flex items-center gap-4 border-t border-[#221e1a]/10 py-4">
      <div className="w-12 shrink-0 leading-none">
        <div className="text-[11px] font-semibold text-[#6e655b]">{Number(mm)}월</div>
        <div className="font-display mt-1 text-[40px] leading-[0.85] tabular-nums text-[#221e1a]">{dd}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs text-[#6e655b]">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold leading-none ${CATEGORY_COLORS[item.category] ?? "bg-neutral-100 text-neutral-500"}`}>
            {item.category}
          </span>
          {item.time && <span className="tabular-nums">{item.time}</span>}
          {item.city && <span className="truncate">· {item.city}</span>}
        </div>
        <p className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-[#221e1a]">{item.title}</p>
      </div>
    </li>
  );
}

function dDay(deadline: Date, now: Date): string {
  const kst = (d: Date) => new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
  const days = Math.round((Date.parse(kst(deadline)) - Date.parse(kst(now))) / 86_400_000);
  return days <= 0 ? "D-DAY" : `D-${days}`;
}

export async function HomeQuickView() {
  const t = await getTranslations("quickview");
  const [allSchedule, rawVotes] = await Promise.all([
    fetchAllFutureSchedule(),
    fetchRawVotes(),
  ]);

  const now = new Date();
  const voteItems = rawVotes.flatMap((item) => {
    const m = item.deadline.match(/(\d{4})[.\-](\d{2})[.\-](\d{2})(?:\s+(\d{2}):(\d{2}))?/);
    if (!m) return [];
    const deadlineDate = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4] ?? "23"}:${m[5] ?? "59"}:00+09:00`);
    return now <= deadlineDate ? [{ ...item, deadlineDate }] : [];
  });

  const today = getKSTToday();
  const weekEnd = getKSTWeekEnd();

  const thisWeek = allSchedule.filter((item) => item.date >= today && item.date <= weekEnd);
  const nextUpcoming = allSchedule.filter((item) => item.date > weekEnd).slice(0, 3);
  const hasAnySchedule = allSchedule.some((item) => item.date >= today);

  if (!hasAnySchedule && voteItems.length === 0) return null;

  const scheduleItems = thisWeek.length > 0 ? thisWeek : nextUpcoming;
  const scheduleLabel = thisWeek.length > 0 ? t("thisWeekSchedule") : t("nextSchedule");

  const more = t("viewAll").replace(/\s*→\s*$/, "");

  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
      {/* 스케줄 */}
      <section className={HOME_CARD}>
        <SectionHead
          no="02"
          label={scheduleLabel}
          title="Up"
          em="next"
          right={<Link href="/schedule" className={PILL}>{more} ↗</Link>}
        />
        {scheduleItems.length === 0 ? (
          <p className="mt-5 border-t border-[#221e1a]/10 pt-4 text-sm text-[#6e655b]">{t("noSchedule")}</p>
        ) : (
          <ul className="mt-5">
            {scheduleItems.slice(0, 3).map((item) => (
              <ScheduleItemRow key={item.id} item={item} />
            ))}
          </ul>
        )}
        {thisWeek.length > 3 && (
          <Link href="/schedule" className="mt-1 flex min-h-11 items-center justify-center rounded-full border border-[#221e1a]/10 text-[13px] font-semibold text-[#6e655b] hover:text-[#221e1a]">
            +{thisWeek.length - 3}
          </Link>
        )}
      </section>

      {/* 진행 중인 투표 */}
      <section className={HOME_CARD}>
        <SectionHead
          no="03"
          label={t("activeVotes")}
          title="Cast a"
          em="vote"
          right={<Link href="/vote" className={PILL}>{more} ↗</Link>}
        />
        {voteItems.length === 0 ? (
          <p className="mt-5 border-t border-[#221e1a]/10 pt-4 text-sm text-[#6e655b]">{t("noVotes")}</p>
        ) : (
          <ul className="mt-5">
            {voteItems.slice(0, 4).map((item, i) => (
              <li key={i} className="flex items-center gap-3.5 border-t border-[#221e1a]/10 py-4">
                <span className="font-display w-14 shrink-0 text-[26px] leading-none tabular-nums text-[#221e1a]">
                  {dDay(item.deadlineDate, now)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#221e1a]">{item.name}</p>
                  {item.organizer && <p className="mt-0.5 truncate text-xs text-[#6e655b]">{item.organizer}</p>}
                </div>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 shrink-0 items-center gap-1 rounded-full bg-[#221e1a] px-4 text-[13px] font-bold text-[#faf6ef] transition hover:bg-black"
                  >
                    {t("voteBtn").replace(/↗/g, "").trim()} ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        {voteItems.length > 4 && (
          <Link href="/vote" className="mt-1 flex min-h-11 items-center justify-center rounded-full border border-[#221e1a]/10 text-[13px] font-semibold text-[#6e655b] hover:text-[#221e1a]">
            +{voteItems.length - 4}
          </Link>
        )}
      </section>
    </div>
  );
}
