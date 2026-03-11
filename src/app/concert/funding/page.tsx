import { BinderPage, BinderHeading } from "@/components/concert/BinderPage";
import { PixelButton } from "@/components/concert/PixelButton";
import { FundingFormModal } from "@/components/concert/FundingFormModal";
import { NoticeLocalizedImages } from "@/components/NoticeLocalizedImages";
import { announcements } from "@/data/announcements";

const ACCENT = "#ffd700";

// 1시간마다 재검증 (Vercel ISR)
export const revalidate = 3600;

async function getFundPercent(): Promise<number> {
  const url = process.env.FUND_SHEET_CSV_URL;
  if (!url) return 35;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const text = await res.text();
    const value = parseFloat(text.split("\n")[1].split(",")[0].trim());
    if (!isNaN(value) && value >= 0 && value <= 100) return value;
  } catch {
    // 실패 시 기본값 사용
  }
  return 35;
}

// 디데이 기준일 (콘서트 첫날)
const CONCERT_DATE = new Date("2026-04-10T00:00:00+09:00");

function getDDay() {
  const diff = Math.ceil(
    (CONCERT_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diff > 0) return `EXhOrizon in SEOUL D-${diff}`;
  if (diff === 0) return "D-DAY";
  return `D+${Math.abs(diff)}`;
}

const TOTAL_CELLS = 10; // 배터리 칸 수

export default async function ConcertFundingPage() {
  const FUND_PERCENT = await getFundPercent();
  const notice = announcements.find((a) => a.id === "2");
  const dDay = getDDay();
  const filledCells = Math.round((FUND_PERCENT / 100) * TOTAL_CELLS);

  return (
    <BinderPage activeTab="funding" pixelFontFamily="'Mulmaru', 'PFStarDust', monospace">
      <BinderHeading
        emoji="💰"
        title="모금"
        subtitle="FUNDING"
        accentColor={ACCENT}
      />

      {notice ? (
        <div className="pb-6">
          {/* ══ D-day + 픽셀 배터리 ══ */}
          <div
            style={{
              marginBottom: "18px",
              background: "rgba(0,0,0,0.35)",
              border: `1.5px solid ${ACCENT}33`,
              borderRadius: "6px",
              padding: "12px 14px",
            }}
          >
            {/* 헤더 행 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "0.48rem",
                  letterSpacing: "0.28em",
                  color: `${ACCENT}88`,
                  fontWeight: 700,
                }}
              >
                ■ FUNDING STATUS
              </span>
              {/* 디데이 */}
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  color: ACCENT,
                  textShadow: `0 0 10px ${ACCENT}88`,
                }}
              >
                {dDay}
              </span>
            </div>

            {/* 배터리 본체 */}
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              {/* 배터리 바디 */}
              <div
                style={{
                  flex: 1,
                  border: `2px solid ${ACCENT}99`,
                  borderRadius: "3px",
                  padding: "3px",
                  display: "flex",
                  gap: "3px",
                  background: "rgba(0,0,0,0.5)",
                  boxShadow: `inset 0 0 8px rgba(0,0,0,0.6), 0 0 6px ${ACCENT}22`,
                }}
              >
                {Array.from({ length: TOTAL_CELLS }).map((_, i) => {
                  const filled = i < filledCells;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: "18px",
                        borderRadius: "1px",
                        backgroundColor: filled
                          ? ACCENT
                          : `${ACCENT}18`,
                        border: `1px solid ${filled ? ACCENT + "cc" : ACCENT + "22"}`,
                        boxShadow: filled ? `0 0 6px ${ACCENT}88` : "none",
                        transition: "background-color 0.3s",
                      }}
                    />
                  );
                })}
              </div>

              {/* 배터리 단자 돌기 */}
              <div
                style={{
                  width: "5px",
                  height: "12px",
                  backgroundColor: `${ACCENT}77`,
                  borderRadius: "0 2px 2px 0",
                  flexShrink: 0,
                }}
              />
            </div>

            {/* 퍼센트 + 목표 텍스트 */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "flex-end",
                marginTop: "6px",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: ACCENT,
                  letterSpacing: "0.05em",
                  textShadow: `0 0 12px ${ACCENT}99`,
                }}
              >
                {FUND_PERCENT}%
              </span>
              <span
                style={{
                  fontSize: "0.42rem",
                  letterSpacing: "0.18em",
                  color: `${ACCENT}44`,
                  fontWeight: 400,
                  paddingBottom: "2px",
                }}
              >
                CHARGED
              </span>
            </div>
          </div>

          {/* 로컬라이즈드 이미지 (언어별 탭) */}
          {notice.localizedImages && notice.localizedImages.length > 0 ? (
            <NoticeLocalizedImages
              itemId={notice.id}
              sections={notice.localizedImages}
              fallbackContent={notice.content}
              dark
            />
          ) : null}

          {/* 일반 이미지 (localizedImages 없을 때) */}
          {notice.images && notice.images.length > 0 && !notice.localizedImages?.length ? (
            <div className="space-y-3 mt-4">
              {notice.images.map((img, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden"
                  style={{ border: `1.5px solid ${ACCENT}44` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-auto w-full object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : null}

          {/* TOSS / PAYPAL / 입금 폼 작성 — NoticeDetailPage처럼 */}
<div className="mt-5 flex flex-wrap items-end justify-between gap-3">
  <div className="flex flex-wrap gap-3">
    {notice.actions?.map((action, idx) => {
      if (action.label === "TOSS") {
        return (
          <PixelButton
            key={idx}
            label="TOSS"
            accentColor="#00c4db"
            shadowColor="#008899"
            textColor="#001a1f"
            href={action.href}
            isToss
          />
        );
      }

      return (
        <PixelButton
          key={idx}
          label={action.label}
          accentColor="#ffd700"
          shadowColor="#a37f00"
          textColor="#1a1100"
          href={action.href}
        />
      );
    })}
  </div>

  {/* 오른쪽 끝으로 */}
  <FundingFormModal />
</div>

          <div className="mt-6" style={{ borderTop: `1px solid ${ACCENT}22` }} />
        </div>
      ) : (
        <p
          style={{
            fontSize: "0.65rem",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.2em",
            paddingTop: "16px",
          }}
        >
          등록된 공지가 없습니다
        </p>
      )}
    </BinderPage>
  );
}
