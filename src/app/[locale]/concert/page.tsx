import { BinderPage } from "@/components/concert/BinderPage";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 7200;

// ─────────────────────────────────────────────────────────
//  CSV 파싱 헬퍼
// ─────────────────────────────────────────────────────────
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

const KO_DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatKoreanDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const dow = KO_DAYS[d.getDay()];
  return `${year}. ${month}. ${day}(${dow})`;
}

// ─────────────────────────────────────────────────────────
//  투어 일정
// ─────────────────────────────────────────────────────────
type TourStop = {
  subtitle: string;
  dateDisplay: string;
  venue: string;
  venueDetail?: string;
};

const FALLBACK_STOP: TourStop = {
  subtitle: "in SEOUL",
  dateDisplay: "2026. 04. 10(금) - 12(일)",
  venue: "KSPO DOME",
};

const CONCERT_TITLE_KEYWORD = "EXhOrizon";

async function getNextTourStop(): Promise<TourStop> {
  const csvUrl = process.env.SCHEDULE_SHEET_CSV_URL;
  if (!csvUrl) return FALLBACK_STOP;

  try {
    const res = await fetch(csvUrl, { next: { revalidate: 7200 } });
    if (!res.ok) return FALLBACK_STOP;

    const text = await res.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return FALLBACK_STOP;

    // 컬럼: 날짜(0) 시간(1) 제목(2) 카테고리(3) 도시(4) 국가(5) 장소(6)
    type ConcertDate = { date: string; city: string; venue: string };
    const concerts: ConcertDate[] = lines.slice(1).flatMap((line) => {
      const cols = parseCSVLine(line).map((c) => c.trim());
      const [date, , title, category, city, , venue] = cols;
      if (!date || category !== "공연" || !title.includes(CONCERT_TITLE_KEYWORD)) return [];
      return [{ date, city: city ?? "", venue: venue ?? "" }];
    });

    if (!concerts.length) return FALLBACK_STOP;

    // 같은 도시+장소 기준으로 그룹화
    type Group = { city: string; venue: string; dates: string[] };
    const groups: Group[] = [];
    for (const c of concerts) {
      const key = `${c.city}|${c.venue}`;
      const existing = groups.find((g) => `${g.city}|${g.venue}` === key);
      if (existing) {
        existing.dates.push(c.date);
      } else {
        groups.push({ city: c.city, venue: c.venue, dates: [c.date] });
      }
    }
    for (const g of groups) g.dates.sort();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next = groups.find(
      (g) => new Date(g.dates[g.dates.length - 1] + "T00:00:00") >= today
    );
    const stop = next ?? groups[groups.length - 1];

    const firstDate = stop.dates[0];
    const lastDate = stop.dates[stop.dates.length - 1];

    let dateDisplay: string;
    if (firstDate === lastDate) {
      dateDisplay = formatKoreanDate(firstDate);
    } else {
      const first = formatKoreanDate(firstDate);
      const lastD = new Date(lastDate + "T00:00:00");
      const lastDay = String(lastD.getDate()).padStart(2, "0");
      const lastDow = KO_DAYS[lastD.getDay()];
      dateDisplay = `${first} - ${lastDay}(${lastDow})`;
    }

    return {
      subtitle: `in ${stop.city.toUpperCase()}`,
      dateDisplay,
      venue: stop.venue,
    };
  } catch {
    return FALLBACK_STOP;
  }
}

// ─────────────────────────────────────────────────────────
//  콘서트 공통 정보
// ─────────────────────────────────────────────────────────
const CONCERT_BASE = {
  artist: "ARTIST: EXO",
  title: "EXO PLANET #6 - EXhOrizon",
  photo: "diary_main.png" as string | null,
};


export default async function ConcertPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const stop = await getNextTourStop();
  return (
    <BinderPage locale={locale}>
      <div className="pt-5 pb-8">

        {/* ── 아티스트명 ── */}
        <p
          className="text-white/50 mb-1"
          style={{ fontSize: "0.65rem", fontWeight: 400, letterSpacing: "0.2em" }}
        >
          {CONCERT_BASE.artist}
        </p>

        {/* ── 콘서트 타이틀 ── */}
        <h1
          className="text-white leading-[1.05] mb-1 whitespace-pre-line"
          style={{
            fontWeight: 800,
            fontSize: "2.5rem",
            letterSpacing: "0.06em",
            textShadow:
              "2px 2px 0 #00e5ff, 4px 4px 0 rgba(0,229,255,0.2), 0 0 28px rgba(0,229,255,0.4)",
          }}
        >
          {CONCERT_BASE.title}
        </h1>

        {/* ── 부제목 ── */}
        <div
          className="inline-block mb-4 px-3 py-[3px]"
          style={{
            border: "2px solid rgba(0,229,255,0.5)",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.25em",
            color: "#00e5ff",
          }}
        >
          {/* 앵콜콘 확정 시 복구: {stop.subtitle} */}
          COMING SOON
        </div>

        {/* ── 픽셀 구분선 ── */}
        <div className="flex gap-[4px] mb-5">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: i % 2 === 0 ? "#00e5ff" : "transparent",
              }}
            />
          ))}
        </div>

        {/* ── 인포 카드 2열 ── */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* DATE 카드 */}
          <div
            style={{
              border: "3px solid #00e5ff",
              background: "rgba(0,0,0,0.5)",
              padding: "8px 10px",
            }}
          >
            <div
              style={{
                fontSize: "0.5rem",
                fontWeight: 700,
                letterSpacing: "0.35em",
                color: "#00e5ff",
                marginBottom: "5px",
              }}
            >
              DATE
            </div>
            <div className="text-white" style={{ fontSize: "0.78rem", fontWeight: 400 }}>
              {/* 앵콜콘 확정 시 복구: {stop.dateDisplay} */}
              COMING SOON
            </div>
          </div>

          {/* VENUE 카드 */}
          <div
            style={{
              border: "3px solid #ffd700",
              background: "rgba(0,0,0,0.5)",
              padding: "8px 10px",
            }}
          >
            <div
              style={{
                fontSize: "0.5rem",
                fontWeight: 700,
                letterSpacing: "0.35em",
                color: "#ffd700",
                marginBottom: "5px",
              }}
            >
              VENUE
            </div>
            <div className="text-white" style={{ fontSize: "0.78rem", fontWeight: 400 }}>
              {/* 앵콜콘 확정 시 복구: {stop.venue} */}
              COMING SOON
            </div>
            {/* 앵콜콘 확정 시 복구:
            {stop.venueDetail && (
              <div className="text-white/60" style={{ fontSize: "0.6rem", fontWeight: 400, marginTop: "2px" }}>
                {stop.venueDetail}
              </div>
            )} */}
          </div>
        </div>

        {/* ── 사진 영역 ── */}
        <div
          className="relative w-full overflow-hidden mb-4"
          style={{ height: "185px" }}
        >
          {/* 코너 브래킷 */}
          {(
            [
              { top: 0, left: 0, borderTop: "3px solid #00e5ff", borderLeft: "3px solid #00e5ff" },
              { top: 0, right: 0, borderTop: "3px solid #00e5ff", borderRight: "3px solid #00e5ff" },
              { bottom: 0, left: 0, borderBottom: "3px solid #00e5ff", borderLeft: "3px solid #00e5ff" },
              { bottom: 0, right: 0, borderBottom: "3px solid #00e5ff", borderRight: "3px solid #00e5ff" },
            ] as React.CSSProperties[]
          ).map((style, i) => (
            <div
              key={i}
              aria-hidden
              className="absolute z-10"
              style={{ ...style, width: "18px", height: "18px" }}
            />
          ))}

          {CONCERT_BASE.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/images/concert/design/${CONCERT_BASE.photo}`}
              alt="Concert photo"
              className="w-full h-full object-cover"
            />
          ) : (
            /* 플레이스홀더 */
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{
                border: "2px dashed rgba(255,255,255,0.15)",
                background: "rgba(0,229,255,0.03)",
              }}
            >
              <span style={{ fontSize: "2rem", opacity: 0.35 }}>📸</span>
              <span
                style={{
                  fontSize: "0.55rem",
                  letterSpacing: "0.3em",
                  color: "rgba(255,255,255,0.25)",
                  fontWeight: 400,
                }}
              >
                PHOTO HERE
              </span>
              <span
                style={{
                  fontSize: "0.5rem",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.15)",
                  fontWeight: 400,
                }}
              >
                README 참고
              </span>
            </div>
          )}
        </div>

        {/* ── 초능력 이미지 ── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/초능력.png"
          alt=""
          aria-hidden
          className="mb-5"
          style={{ width: "100%", height: "auto", opacity: 0.75 }}
        />

        {/* ── 하단 장식 ── */}
        <div
          className="mt-8 text-center"
          style={{
            fontSize: "0.6rem",
            letterSpacing: "0.4em",
            color: "rgba(255,255,255,0.18)",
            fontWeight: 400,
          }}
        >
          ★ · · · · · · ★
        </div>
      </div>
    </BinderPage>
  );
}
