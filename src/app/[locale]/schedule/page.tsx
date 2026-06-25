import { ScheduleCalendar, type ScheduleItem, type ScheduleCategory } from "@/components/ScheduleCalendar";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const revalidate = 7200;

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

const VALID_CATEGORIES = new Set<ScheduleCategory>(["공연", "앨범", "기념일", "영상", "티켓팅"]);

async function fetchScheduleItems(): Promise<ScheduleItem[]> {
  const csvUrl = process.env.SCHEDULE_SHEET_CSV_URL;
  if (!csvUrl) return [];

  try {
    const res = await fetch(csvUrl, { next: { revalidate: 7200 } });
    if (!res.ok) return [];

    const text = await res.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    // 컬럼: 날짜(0) 시간(1) 제목(2) 카테고리(3) 도시(4) 국가(5) 장소(6)
    return lines.slice(1).flatMap((line, i) => {
      const cols = parseCSVLine(line).map((c) => c.trim());
      const [date, time, title, category, city, country, venue] = cols;
      if (!date || !title || !category) return [];
      if (!VALID_CATEGORIES.has(category as ScheduleCategory)) return [];

      return [{
        id: `sheet-${i}-${date}`,
        date,
        time: time || undefined,
        title,
        category: category as ScheduleCategory,
        city: city || undefined,
        country: country || undefined,
        venue: venue || undefined,
      }];
    });
  } catch {
    return [];
  }
}

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("schedule");
  const items = await fetchScheduleItems();

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div className="mt-8">
        <ScheduleCalendar items={items} />
      </div>
    </main>
  );
}
