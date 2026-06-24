import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// ─────────────────────────────────────────────────────────
//  카테고리 정의 — 탭 순서·색상·링크 변경은 여기서
// ─────────────────────────────────────────────────────────
export const BINDER_CATEGORIES = [
  {
    id: "cheer",
    title: "응원법",
    emoji: "📣",
    href: "/concert/cheer",
    tabColor: "#ff4d8d",
    textColor: "#2a000e",
  },
  {
    id: "funding",
    title: "모금",
    emoji: "💰",
    href: "/concert/funding",
    tabColor: "#ffd700",
    textColor: "#1a1100",
  },
  {
    id: "notice",
    title: "공지",
    emoji: "📋",
    href: "/concert/notice",
    tabColor: "#ff9b3d",
    textColor: "#1a0500",
  },
  {
    id: "chorus",
    title: "떼창곡",
    emoji: "🎵",
    href: "/concert/chorus",
    tabColor: "#00e5ff",
    textColor: "#001a1f",
  },
  {
    id: "helper",
    title: "헬퍼모집",
    emoji: "🛸",
    href: "/concert/helper",
    tabColor: "#c084fc",
    textColor: "#0d0020",
  },
  {
    id: "vote",
    title: "아바타스타",
    emoji: "🗳️",
    href: "/concert/vote",
    tabColor: "#a3e635",
    textColor: "#0d1a00",
  },
] as const;

export type CategoryId = (typeof BINDER_CATEGORIES)[number]["id"];

interface BinderPageProps {
  children: React.ReactNode;
  /** 현재 활성 탭 ID — 없으면 메인 화면 */
  activeTab?: CategoryId;
  /** 페이지 콘텐츠에 적용할 픽셀 폰트 패밀리 (기본: PFStarDust) */
  pixelFontFamily?: string;
  locale: string;
}

const PIXEL_FONT: React.CSSProperties = {
  fontFamily: "'PFStarDust', monospace",
  WebkitFontSmoothing: "none",
};

// ─────────────────────────────────────────────────────────
//  ★ 인덱스 탭 크기 조절 — 여기만 수정하면 됩니다
//    TAB_W  : 탭 가로폭 (px)
//    TAB_H  : 탭 세로 높이 (px)
//    TAB_FONT_SIZE : 탭 텍스트 크기 (rem)  ← 크게 할수록 글자가 커짐
//    TAB_EMOJI_SIZE: 탭 이모지 크기 (rem)
// ─────────────────────────────────────────────────────────
const TAB_W = 25;        // px — 줄일수록 탭이 얇아지고 본문이 넓어짐
const TAB_H = 80;        // px — 높이는 모든 탭에 동일 적용
const TAB_EMOJI_SIZE = "0.8rem";  // 탭 이모지 크기

// 로케일별 탭 텍스트 스타일 (zh/ja는 글자가 많아 작은 폰트+좁은 자간 사용)
function getTabTextStyle(locale: string): { fontSize: string; letterSpacing: string } {
  if (locale === "ja") return { fontSize: "0.55rem", letterSpacing: "0.04em" };
  if (locale === "zh") return { fontSize: "0.60rem", letterSpacing: "0.1em" };
  if (locale === "en") return { fontSize: "0.65rem", letterSpacing: "0.05em" };
  return { fontSize: "0.65rem", letterSpacing: "0.35em" }; // ko default
}

export async function BinderPage({ children, activeTab, pixelFontFamily, locale }: BinderPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations("concert");
  const tabLabels: Record<CategoryId, string> = {
    cheer: t("tab.cheer"),
    chorus: t("tab.chorus"),
    helper: t("tab.helper"),
    funding: t("tab.funding"),
    notice: t("tab.notice"),
    vote: t("tab.vote"),
  };
  return (
    /* 바깥 여백 — 모바일에서 사방 숨쉬기 */
    <div
      className="px-4 pt-5 pb-6 flex justify-center"
      style={{ ...PIXEL_FONT, fontFamily: pixelFontFamily ?? PIXEL_FONT.fontFamily }}
    >
      <div className="flex w-full" style={{ maxWidth: "500px" }}>

        {/* ──────────── 바인더 본체 ──────────── */}
        <div
          className="flex-1 min-w-0 relative"
          style={{
            background:
              "linear-gradient(170deg, rgba(10,12,28,0.98) 0%, rgba(5,7,18,0.99) 100%)",
            border: "2.5px solid rgba(255,255,255,0.5)",
            boxShadow: [
              "inset 0 0 50px rgba(0,229,255,0.025)",
              "inset 1px 0 0 rgba(255,255,255,0.04)",
              "6px 0 20px rgba(0,0,0,0.6)",
            ].join(", "),
          }}
        >


          {/* 페이지 내용 */}
          <div className="relative z-10 pl-[25px] pr-4 min-w-0 overflow-hidden">{children}</div>
        </div>

        {/* ──────────── 인덱스 탭 컬럼 ──────────── */}
        <div
          className="flex flex-col gap-[3px] pt-[2px]"
          style={{ width: `${TAB_W}px` }}
        >
          {BINDER_CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="group flex flex-col items-center select-none"
                style={{
                  flex: "none",               /* 고정 크기 — 절대 늘어나지 않음 */
                  height: cat.id === "vote" ? "108px" : `${TAB_H}px`,
                  paddingTop: "10px",
                  paddingBottom: "8px",
                  gap: "6px",
                  overflow: "hidden",         /* 탭 경계 밖으로 글자 못 나오게 */
                  backgroundColor: isActive ? cat.tabColor : "rgba(248, 246, 238, 0.95)",
                  borderTop: `3px solid ${cat.tabColor}`,
                  borderRight: "2px solid rgba(255,255,255,0.45)",
                  borderBottom: "none",
                  borderLeft: "none",
                  borderTopRightRadius: "10px",
                  borderBottomRightRadius: "10px",
                  boxShadow: isActive
                    ? `3px 0 12px ${cat.tabColor}55`
                    : "2px 2px 6px rgba(0,0,0,0.45)",
                  transition: "background-color 0.15s, box-shadow 0.15s",
                }}
              >
                {/* 이모지 */}
                <span
                  className="leading-none transition-transform group-hover:scale-110"
                  style={{ fontSize: TAB_EMOJI_SIZE }}
                >
                  {cat.emoji}
                </span>

                {/* 세로 텍스트 */}
                <span
                  className="flex-1 flex items-center justify-center"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: locale === "ko" ? "upright" : "mixed",
                    fontFamily: locale === "ko"
                      ? "'PFStarDust', monospace"
                      : "'Mulmaru', 'PFStarDust', monospace",
                    WebkitFontSmoothing: "none",
                    fontWeight: 800,
                    ...getTabTextStyle(locale),
                    // vote 탭 ko: 108px 높이에 맞게 폰트·자간 조정
                    ...(cat.id === "vote" && locale === "ko"
                      ? { fontSize: "0.65rem", letterSpacing: "0.22em" }
                      : {}),
                    color: isActive ? cat.textColor : "#1a1020",
                  }}
                >
                  {tabLabels[cat.id]}
                </span>
              </Link>
            );
          })}

          {/* 탭 아래 빈 공간 */}
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  서브 페이지 공통 헤딩
// ─────────────────────────────────────────────────────────
export function BinderHeading({
  emoji,
  title,
  subtitle,
  accentColor,
  showEmoji = true,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  accentColor: string;
  showEmoji?: boolean;
}) {
  return (
    <div className="pt-5 pb-4">
      <div className="flex items-center gap-2 mb-[2px]">
        {showEmoji && <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{emoji}</span>}
        <h1
          className="text-white leading-none"
          style={{
            fontWeight: 800,
            fontSize: "1.5rem",
            letterSpacing: "0.08em",
            textShadow: `2px 2px 0 ${accentColor}, 0 0 18px ${accentColor}55`,
          }}
        >
          {title}
        </h1>
      </div>
      {subtitle && (
        <p
          style={{
            fontSize: "0.55rem",
            letterSpacing: "0.28em",
            color: accentColor,
            fontWeight: 400,
            opacity: 0.8,
          }}
        >
          {subtitle}
        </p>
      )}
      {/* 픽셀 구분선 */}
      <div className="flex gap-[3px] mt-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: "5px",
              height: "4px",
              backgroundColor: i % 2 === 0 ? accentColor : "transparent",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  준비중 플레이스홀더
// ─────────────────────────────────────────────────────────
export function ComingSoon({ accentColor }: { accentColor: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-14 gap-3"
      style={{ color: "rgba(255,255,255,0.25)" }}
    >
      <div style={{ fontSize: "2.2rem" }}>🔭</div>
      <div
        style={{
          fontSize: "0.62rem",
          letterSpacing: "0.28em",
          color: accentColor,
          fontWeight: 700,
          opacity: 0.85,
        }}
      >
        COMING SOON
      </div>
      <div style={{ fontSize: "0.55rem", letterSpacing: "0.18em", fontWeight: 400 }}>
        준비 중입니다
      </div>
    </div>
  );
}
