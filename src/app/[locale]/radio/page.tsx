import { RadioPageClient } from "@/components/RadioPageClient";
import type { RadioStation, RadioProgram } from "@/components/RadioPageClient";

export const revalidate = 86400; // 매일 1회 재검증

// ── 선정 가능 프로그램 패턴 (부분 문자열 매칭) ─────────
const SELECTABLE_PATTERNS: Record<string, string[]> = {
  "sbs-power": ["김영철", "컬투쇼", "황제파워", "러브게임", "영스트리트"],
  "sbs-love":  [],
  "kbs-cool":  ["박명수", "가요광장", "슈퍼라디오", "미스터 라디오", "키스더라디오"],
  "mbc-fm4u":  ["희망곡", "데이트", "이상순", "별이 빛나는"],
  "mbc-std":   [],
};

function t(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

function rawToPrograms(
  raw: { time: string; name: string }[],
  stationId: string
): RadioProgram[] {
  if (!raw.length) return [];
  const items = raw.map((p) => ({ name: p.name, start: t(p.time) }));
  const patterns = SELECTABLE_PATTERNS[stationId] ?? [];
  return items.map((p, i) => {
    const circularEnd = items[(i + 1) % items.length].start;
    const duration = circularEnd > p.start
      ? circularEnd - p.start
      : circularEnd + 1440 - p.start;
    // 마지막 프로그램이 첫 프로그램으로 순환할 때 5시간 초과면 자정 처리
    const end = i === items.length - 1 && duration > 300 ? 0 : circularEnd;
    return {
      name: p.name,
      start: p.start,
      end,
      selectable: patterns.some((pat) => p.name.includes(pat)),
    };
  });
}

function fmtTime(raw: string): string {
  if (raw.length < 4) return "00:00";
  return `${raw.slice(0, 2)}:${raw.slice(2, 4)}`;
}

function getKSTDate(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
  return `${kst.getFullYear()}${String(kst.getMonth() + 1).padStart(2, "0")}${String(kst.getDate()).padStart(2, "0")}`;
}

// ── SBS (파워FM + 러브FM) JSON API ────────────────────
async function fetchSBS(): Promise<{
  power: { time: string; name: string }[];
  love: { time: string; name: string }[];
}> {
  try {
    const d = getKSTDate();
    const res = await fetch(
      `https://static.apis.sbs.co.kr/radio-api/schedule/${d}`,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; Next.js)" } }
    );
    if (!res.ok) return { power: [], love: [] };
    const json = await res.json() as {
      data: {
        power: { start_time: string; title: string; pgm_cd: string }[];
        love:  { start_time: string; title: string; pgm_cd: string }[];
      };
    };
    function parseChannel(
      items: { start_time: string; title: string; pgm_cd: string }[]
    ): { time: string; name: string }[] {
      const seen = new Set<string>();
      return items.flatMap((i) => {
        if (i.pgm_cd.startsWith("sbsradionews")) return [];
        const time = fmtTime(i.start_time);
        const name = (i.title ?? "").trim();
        if (!name || seen.has(time)) return [];
        seen.add(time);
        return [{ time, name }];
      });
    }
    return {
      power: parseChannel(json.data?.power ?? []),
      love:  parseChannel(json.data?.love  ?? []),
    };
  } catch {
    return { power: [], love: [] };
  }
}

// ── MBC FM4U JSON API ─────────────────────────────────
async function fetchMBCFm4u(): Promise<{ time: string; name: string }[]> {
  try {
    const d = getKSTDate();
    const res = await fetch(
      `https://control.imbc.com/Schedule/Radio?date=${d}`,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; Next.js)" } }
    );
    if (!res.ok) return [];
    const json = await res.json() as { Title: string; StartTime: string; RunningTime: string }[];
    const seen = new Set<string>();
    const programs: { time: string; name: string }[] = [];
    for (const s of json) {
      if (parseInt(s.RunningTime ?? "0") < 30) continue;
      const time = fmtTime(s.StartTime ?? "");
      const name = (s.Title ?? "").trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      programs.push({ time, name });
    }
    return programs;
  } catch {
    return [];
  }
}

// ── MBC 표준FM XML API ───────────────────────────────
async function fetchMBCStd(): Promise<{ time: string; name: string }[]> {
  try {
    const res = await fetch(
      "https://guide.imbc.com/api/radioScheduleByMobile.aspx",
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; Next.js)" } }
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const titles = [...xml.matchAll(/<TITLE><!\[CDATA\[([\s\S]*?)\]\]><\/TITLE>/g)].map(
      (m) => m[1].replace(/<br>/gi, " ").trim().replace(/\s+/g, " ")
    );
    const starts = [...xml.matchAll(/<STARTDATE><!\[CDATA\[([\s\S]*?)\]\]><\/STARTDATE>/g)].map(
      (m) => m[1]
    );
    return titles
      .map((name, i) => ({ time: starts[i] ?? "00:00", name }))
      .filter((p) => p.name);
  } catch {
    return [];
  }
}

// ── KBS COOL FM (2FM) JSON API (channel_code=25) ─────
async function fetchKBSCoolFM(): Promise<{ time: string; name: string }[]> {
  try {
    const d = getKSTDate();
    const res = await fetch(
      `https://static.api.kbs.co.kr/mediafactory/v1/schedule/weekly?local_station_code=00&channel_code=25&program_planned_date_from=${d}&program_planned_date_to=${d}`,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; Next.js)" } }
    );
    if (!res.ok) return [];
    const json = await res.json() as {
      channel_code: string;
      schedules: {
        program_planned_start_time: string;
        program_title: string;
        program_planned_duration_m?: string;
        rerun_classification?: string;
      }[];
    }[];
    const channel = json.find((ch) => ch.channel_code === "25");
    if (!channel) return [];
    const seenNames = new Set<string>();
    const programs: { time: string; name: string }[] = [];
    for (const s of channel.schedules) {
      if ((s.rerun_classification ?? "") === "재방") continue;
      if (parseInt(s.program_planned_duration_m ?? "0") < 30) continue;
      const raw = s.program_planned_start_time ?? "";
      if (raw.length < 4 || parseInt(raw.slice(0, 2)) >= 24) continue;
      const time = `${raw.slice(0, 2)}:${raw.slice(2, 4)}`;
      const name = (s.program_title ?? "")
        .replace(/\s*제작협찬\s*/g, "")
        .trim()
        .replace(/\s+/g, " ");
      if (!name || seenNames.has(name)) continue;
      seenNames.add(name);
      programs.push({ time, name });
    }
    return programs;
  } catch {
    return [];
  }
}

// ── 정적 폴백 데이터 ──────────────────────────────────
const SBS_POWER_FALLBACK = [
  { time: "01:00", name: "애프터클럽" },
  { time: "03:00", name: "파워 스테이션" },
  { time: "05:00", name: "이인권의 펀펀투데이" },
  { time: "07:00", name: "김영철의 파워FM" },
  { time: "09:00", name: "아름다운 이 아침, 봉태규입니다" },
  { time: "11:00", name: "박하선의 씨네타운" },
  { time: "12:00", name: "12시엔 주현영" },
  { time: "14:00", name: "두시탈출 컬투쇼" },
  { time: "16:00", name: "황제성의 황제파워" },
  { time: "18:00", name: "박소현의 러브게임" },
  { time: "20:00", name: "웬디의 영스트리트" },
  { time: "22:00", name: "배성재의 텐" },
  { time: "23:00", name: "딘딘의 뮤직하이" },
];

const SBS_LOVE_FALLBACK = [
  { time: "00:00", name: "YESTERDAY 20" },
  { time: "02:00", name: "Love 20" },
  { time: "04:00", name: "OLDIES 20" },
  { time: "06:05", name: "고현준의 뉴스 브리핑" },
  { time: "07:05", name: "김태현의 정치쇼" },
  { time: "09:05", name: "이숙영의 러브FM" },
  { time: "11:00", name: "박연미의 목돈연구소" },
  { time: "12:05", name: "유민상의 배고픈 라디오" },
  { time: "14:20", name: "그대의 오후, 정엽입니다" },
  { time: "16:00", name: "인생은 오디션" },
  { time: "17:00", name: "편상욱의 뉴스직격" },
  { time: "18:05", name: "6시 저녁바람 김창완입니다" },
  { time: "20:05", name: "김윤상의 뮤직투나잇" },
  { time: "22:05", name: "음악이 흐르는 밤, 박은경입니다" },
];

const KBS_COOL_FALLBACK = [
  { time: "00:00", name: "스테이션 제로" },
  { time: "05:00", name: "상쾌한 아침" },
  { time: "07:00", name: "조정식의 FM대행진" },
  { time: "09:00", name: "이현우의 음악앨범" },
  { time: "11:00", name: "박명수의 라디오쇼" },
  { time: "12:00", name: "이은지의 가요광장" },
  { time: "14:00", name: "하하의 슈퍼라디오" },
  { time: "16:00", name: "윤정수 남창희의 미스터 라디오" },
  { time: "18:00", name: "사랑하기 좋은 날 이금희입니다" },
  { time: "20:00", name: "오마이걸 효정의 볼륨을 높여요" },
  { time: "22:00", name: "한해의 키스더라디오" },
];

const MBC_FM4U_FALLBACK = [
  { time: "00:00", name: "FM영화음악 김세윤입니다" },
  { time: "01:00", name: "아이돌 라디오 핫트랙" },
  { time: "03:00", name: "음악의 발견" },
  { time: "05:05", name: "응답하라 20세기" },
  { time: "06:00", name: "세상을 여는 아침, 이영은입니다" },
  { time: "07:00", name: "굿모닝FM 테이입니다" },
  { time: "09:00", name: "오늘 아침 윤상입니다" },
  { time: "11:00", name: "안녕하세요 이문세입니다" },
  { time: "12:00", name: "정오의 희망곡 김신영입니다" },
  { time: "14:00", name: "두시의 데이트 안영미입니다" },
  { time: "16:00", name: "완벽한 하루 이상순입니다" },
  { time: "18:00", name: "배철수의 음악캠프" },
  { time: "20:00", name: "김이나의 별이 빛나는 밤에" },
  { time: "22:00", name: "친한친구 방송반" },
];

const MBC_STD_FALLBACK = [
  { time: "06:15", name: "아침&뉴스 김성경입니다" },
  { time: "07:05", name: "심인보의 시선집중" },
  { time: "08:30", name: "이진우의 손에 잡히는 경제" },
  { time: "09:05", name: "여성시대 양희은,서경석입니다" },
  { time: "11:05", name: "오승훈의 라디오 문화센터" },
  { time: "12:20", name: "손태진의 트로트라디오" },
  { time: "14:05", name: "박준형, 정경미의 2시만세" },
  { time: "16:05", name: "정선희, 문천식의 지금은 라디오시대" },
  { time: "18:05", name: "권순표의 뉴스하이킥" },
  { time: "20:05", name: "오늘도 당신 편 이재은입니다" },
  { time: "22:05", name: "박정호의 손에 잡히는 경제 플러스" },
  { time: "23:05", name: "신혜림의 골든디스크" },
];

// ── 페이지 ────────────────────────────────────────────
export default async function RadioPage() {
  const [sbsResult, mbcFm4uRaw, mbcStdRaw, kbsCoolRaw] = await Promise.all([
    fetchSBS(),
    fetchMBCFm4u(),
    fetchMBCStd(),
    fetchKBSCoolFM(),
  ]);

  const stations: RadioStation[] = [
    {
      id: "sbs-power",
      broadcaster: "SBS",
      name: "SBS 파워FM",
      frequency: "107.7 MHz",
      smsTo: "#1077",
      programs: rawToPrograms(
        sbsResult.power.length > 0 ? sbsResult.power : SBS_POWER_FALLBACK,
        "sbs-power"
      ),
    },
    {
      id: "sbs-love",
      broadcaster: "SBS",
      name: "SBS 러브FM",
      frequency: "103.5 MHz",
      smsTo: "#1035",
      programs: rawToPrograms(
        sbsResult.love.length > 0 ? sbsResult.love : SBS_LOVE_FALLBACK,
        "sbs-love"
      ),
    },
    {
      id: "kbs-cool",
      broadcaster: "KBS",
      name: "KBS COOL FM",
      frequency: "89.1 MHz",
      smsTo: "#8910",
      programs: rawToPrograms(
        kbsCoolRaw.length > 0 ? kbsCoolRaw : KBS_COOL_FALLBACK,
        "kbs-cool"
      ),
    },
    {
      id: "mbc-fm4u",
      broadcaster: "MBC",
      name: "MBC FM4U",
      frequency: "91.9 MHz",
      smsTo: "#8000",
      programs: rawToPrograms(
        mbcFm4uRaw.length > 0 ? mbcFm4uRaw : MBC_FM4U_FALLBACK,
        "mbc-fm4u"
      ),
    },
    {
      id: "mbc-std",
      broadcaster: "MBC",
      name: "MBC 표준FM",
      frequency: "95.9 MHz",
      smsTo: "#8001",
      programs: rawToPrograms(
        mbcStdRaw.length > 0 ? mbcStdRaw : MBC_STD_FALLBACK,
        "mbc-std"
      ),
    },
  ];

  return <RadioPageClient stations={stations} />;
}
